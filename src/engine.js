/**
 * 幽門螺旋桿菌（H. pylori）陽性處置決策引擎
 *
 * 單一真相來源：rules.json
 * 診間決策工具與衛教單張共用此引擎，不得各自實作判斷邏輯。
 *
 * 用法（瀏覽器）：由 build.js 內嵌後，透過 window.HpEngine.decide(input) 呼叫
 * 用法（Node）  ：const { decide } = require('./engine.js')
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./rules.json'));
  } else {
    root.HpEngine = factory(root.HP_RULES);
  }
})(typeof self !== 'undefined' ? self : this, function (RULES) {
  'use strict';

  /**
   * 依輸入條件找出對應的決策規則（decisionRules）
   * @param {object} ctx { line, allergy }
   * @returns 規則物件或 null
   */
  function resolveDecision(ctx) {
    const rule = RULES.decisionRules.find(function (r) {
      return r.when.line === ctx.line && r.when.allergy === ctx.allergy;
    });
    return rule || null;
  }

  /**
   * 依複檢情境找出對應的給付規則（retest.paymentRules）
   * 比對順序：先比對最明確的條件，規則陣列即為依精確度排列。
   * @param {object} ctx { ulcer, age4574 }
   * @returns 給付規則物件或 null
   */
  function resolvePayment(ctx) {
    const rules = RULES.retest.paymentRules;
    for (let i = 0; i < rules.length; i++) {
      const w = rules[i].when;
      // 以規則中「有寫的條件」逐一比對，未寫的條件不限制
      let hit = true;
      if (w.ulcer !== undefined && w.ulcer !== ctx.ulcer) hit = false;
      if (w.age4574 !== undefined && w.age4574 !== ctx.age4574) hit = false;
      if (hit) return rules[i];
    }
    return null;
  }

  /**
   * 組出療程卡片的顯示資料
   * @param {string} regimenId
   * @returns 含名稱、藥品表、天數、備註、出處
   */
  function regimenView(regimenId) {
    const r = RULES.regimens[regimenId];
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      fact: r.fact,
      containsAmoxicillin: r.containsAmoxicillin,
      drugs: r.drugs,
      durationDays: r.durationDays,
      durationNote: r.durationNote,
      note: r.note,
      sources: r.sources
    };
  }

  /**
   * 依 fact ID 查來源（出處）資料
   * @param {string} id
   * @returns 來源物件或 null
   */
  function sourceOf(id) {
    return RULES.meta.sources[id] || null;
  }

  /** 收集給定 fact ID 清單對應的來源，去重且保序 */
  function collectSources(ids) {
    const seen = {};
    const out = [];
    (ids || []).forEach(function (id) {
      const s = sourceOf(id);
      if (s && !seen[id]) {
        seen[id] = true;
        out.push({ id: id, label: s.label, url: s.url, url2: s.url2, level: s.level, year: s.year });
      }
    });
    return out;
  }

  /**
   * 主判定函式
   * @param {object} input
   * @param {string} input.line       治療線別：first｜second｜refractory
   * @param {string} input.allergy    penicillin 過敏：yes｜no
   * @param {string} [input.ulcer]    有無潰瘍診斷：yes｜no｜unknown（不給時預設 unknown）
   * @param {string} [input.age4574]  是否 45–74 歲：yes｜no（不給時預設 unknown）
   */
  function decide(input) {
    const ctx = {
      line: input.line,
      allergy: input.allergy,
      ulcer: input.ulcer || 'unknown',
      age4574: input.age4574 || 'no'
    };

    // ── 兩次以上失敗：轉診，不給處方 ──
    if (ctx.line === 'refractory') {
      const ref = RULES.refractoryRule;
      return {
        input: ctx,
        outcome: 'refer',
        headline: ref.headline,
        detail: ref.detail,
        regimens: [],
        retest: resolvePayment(ctx),
        familyScreening: RULES.familyScreening,
        warnings: [RULES.warnings.repeatRegimen],
        basis: collectSources(ref.sources),
        disclaimer: RULES.disclaimer,
        rulesVersion: RULES.meta.version
      };
    }

    // ── 一般決策（first / second）──
    const rule = resolveDecision(ctx);
    if (!rule) {
      return {
        input: ctx,
        outcome: 'error',
        headline: '條件組合無法判斷',
        detail: '請確認治療線別與 penicillin 過敏欄位。',
        regimens: [],
        retest: null,
        familyScreening: RULES.familyScreening,
        warnings: [],
        basis: [],
        disclaimer: RULES.disclaimer,
        rulesVersion: RULES.meta.version
      };
    }

    const primary = regimenView(rule.primary);
    const alternatives = (rule.alternatives || []).map(regimenView).filter(Boolean);

    // 過敏防呆：若設定過敏卻出現含 amoxicillin 的處方，代表 rules.json 有 bug
    const leaked = [primary].concat(alternatives).filter(function (r) {
      return ctx.allergy === 'yes' && r && r.containsAmoxicillin;
    });
    if (leaked.length) {
      return {
        input: ctx,
        outcome: 'error',
        headline: '規則表錯誤：過敏者出現含 amoxicillin 處方',
        detail: '請檢查 src/rules.json 的 decisionRules 設定（leaked: ' + leaked.map(function (r) { return r.id; }).join(',') + '）',
        regimens: [],
        retest: null,
        familyScreening: RULES.familyScreening,
        warnings: [],
        basis: [],
        disclaimer: RULES.disclaimer,
        rulesVersion: RULES.meta.version
      };
    }

    const payment = resolvePayment(ctx);
    const allFactIds = [].concat(
      rule.primary ? [rule.primary] : [],
      rule.alternatives || [],
      (primary ? primary.sources : []),
      alternatives.reduce(function (a, r) { return a.concat(r.sources || []); }, []),
      payment ? payment.sources : [],
      [RULES.retest.timingSource, RULES.retest.stopRuleSource, RULES.retest.methodSource],
      RULES.familyScreening.sources
    );
    const basis = collectSources(allFactIds);

    // 警示收集
    const warnings = [];
    const allRegimens = [primary].concat(alternatives).filter(Boolean);
    if (primary) {
      const w = [];
      if (primary.fact === 'RX-01' || primary.fact === 'RX-05') w.push(RULES.warnings.blackStool);
      const hasMetronidazole = allRegimens.some(function (r) {
        return (r.drugs || []).some(function (d) { return d.name === 'Metronidazole'; });
      });
      if (hasMetronidazole) w.push(RULES.warnings.metronidazoleAlcohol);
      w.forEach(function (t) { if (warnings.indexOf(t) === -1) warnings.push(t); });
    }
    warnings.push(RULES.warnings.bloodAntibody);
    if (RULES.retest.timing) warnings.push('複檢時機：' + RULES.retest.timing + '（[FU-01]）');
    if (RULES.retest.stopRule) warnings.push(RULES.retest.stopRule);
    if (RULES.retest.method) warnings.push('複檢方式：' + RULES.retest.method);

    return {
      input: ctx,
      outcome: 'treat',
      headline: rule.headline,
      note: rule.note,
      primary: primary,
      alternatives: alternatives,
      regimens: [primary].concat(alternatives).filter(Boolean),
      retest: payment,
      familyScreening: RULES.familyScreening,
      warnings: warnings,
      basis: basis,
      disclaimer: RULES.disclaimer,
      rulesVersion: RULES.meta.version
    };
  }

  return { decide: decide, RULES: RULES, regimenView: regimenView, sourceOf: sourceOf };
});
