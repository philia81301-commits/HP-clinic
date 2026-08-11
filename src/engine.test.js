/**
 * 決策引擎測試：窮舉＋情境 ＋結構完整性
 *
 * 執行： node src/engine.test.js
 * 無外部依賴（僅 Node 內建 assert），離線可跑。
 *
 * 涵蓋：
 *   1. 窮舉：line(first/second/refractory) × allergy(yes/no)，全部組合不跳 error
 *   2. 過敏防呆：allergy=yes 的輸出絕不含 amoxicillin（含 alternatives）
 *   3. 給付規則：ulcer(yes/no/unknown) × age4574(yes/no) 六組合各命中正確規則
 *   4. 情境對照：對 RDQ 驗收條件的關鍵情境做斷言
 *   5. 完整性：所有 regimen/rule option 都指向存在的 sources，無孤兒建議
 */

const assert = require('assert');
const { decide, RULES } = require('./engine.js');

let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, extra) {
  if (cond) { pass++; }
  else {
    fail++;
    failures.push(name + (extra ? ' → ' + JSON.stringify(extra) : ''));
  }
}

function eq(name, actual, expected) {
  ok(name, JSON.stringify(actual) === JSON.stringify(expected),
    { actual: actual, expected: expected });
}

// ── 1. 窮舉：治療線別 × 過敏 ──
console.log('▶ 窮舉 線別 × 過敏');
const LINES = ['first', 'second', 'refractory'];
const ALLERGIES = ['yes', 'no'];

LINES.forEach(line => {
  ALLERGIES.forEach(allergy => {
    const r = decide({ line: line, allergy: allergy });
    ok(`decide(line=${line}, allergy=${allergy}) 非 error`,
      r.outcome !== 'error', r);
    if (line === 'refractory') {
      ok(`refractory 轉診（line=${line}, allergy=${allergy}）`,
        r.outcome === 'refer' && r.regimens.length === 0, r);
    } else {
      ok(`first/second 應給處方（line=${line}, allergy=${allergy}）`,
        r.outcome === 'treat' && r.regimens.length > 0, r);
    }
  });
});

// ── 2. 過敏防呆：任何 allergy=yes 輸出不得含 amoxicillin ──
console.log('▶ 過敏防呆');
['first', 'second'].forEach(line => {
  const r = decide({ line: line, allergy: 'yes' });
  const leaked = r.regimens.filter(x => x && x.containsAmoxicillin);
  ok(`allergy=yes（line=${line}）無含 amoxicillin 處方`, leaked.length === 0,
    leaked.map(x => x.id));
});

// ── 3. 給付規則六組合 ──
console.log('▶ 給付規則（ulcer × age4574）');
const PAYMENT_EXPECT = {
  'yes/no': 'ulcer-covered',
  'no/yes': 'no-ulcer-age4574',
  'no/no': 'no-ulcer-other',
  'unknown/yes': 'ulcer-unknown',
  'unknown/no': 'ulcer-unknown'
};
// age4574 預設 no → 所以 'yes/yes' 一樣是 ulcer-covered
[['yes', 'yes'], ['yes', 'no']].forEach(([u, a]) => {
  const r = decide({ line: 'first', allergy: 'no', ulcer: u, age4574: a });
  ok(`給付 ulcer=${u} age=${a} → ulcer-covered`, r.retest.id === 'ulcer-covered', r.retest);
});
[['no', 'yes'], ['no', 'no']].forEach(([u, a]) => {
  const r = decide({ line: 'first', allergy: 'no', ulcer: u, age4574: a });
  const exp = a === 'yes' ? 'no-ulcer-age4574' : 'no-ulcer-other';
  ok(`給付 ulcer=${u} age=${a} → ${exp}`, r.retest.id === exp, r.retest);
});
[['unknown', 'yes'], ['unknown', 'no']].forEach(([u, a]) => {
  const r = decide({ line: 'first', allergy: 'no', ulcer: u, age4574: a });
  ok(`給付 ulcer=${u} age=${a} → ulcer-unknown`, r.retest.id === 'ulcer-unknown', r.retest);
});

// ── 4. 情境對照（RDQ 驗收）──
console.log('▶ RDQ 情境');

// 4a. 最常見情境：初次、無過敏、無潰瘍、45–74 歲（主流：篩檢陽性）
const s1 = decide({ line: 'first', allergy: 'no', ulcer: 'no', age4574: 'yes' });
ok('情境一線無過敏：首選鉍劑四合一', s1.primary.id === 'bismuthQuadruple', s1.primary);
ok('情境一線無過敏：提供非鉍劑四合一與 vonoprazan 替代',
  s1.alternatives.map(x => x.id).join(',') === 'concomitantQuadruple,vonoprazanTriple');
eq('情境複檢付費：無潰瘍 + 45–74 歲',
  s1.retest.id, 'no-ulcer-age4574');

// 4b. 過敏：初次 + 過敏，只能鉍劑四合一，無替代
const s2 = decide({ line: 'first', allergy: 'yes' });
eq('情境過敏：一線僅一種處方（鉍劑四合一）', s2.primary.id, 'bismuthQuadruple');
ok('情境過敏：無任何替代處方', s2.alternatives.length === 0);
ok('情境過敏：primary 不含 amoxicillin', s2.primary.containsAmoxicillin === false);

// 4c. 第二線無過敏
const s3 = decide({ line: 'second', allergy: 'no' });
eq('情境二線：首選含鉍四合一', s3.primary.id, 'secondBismuthQuadruple');
// 4d. 第二線過敏：唯一含鉍四合一
const s4 = decide({ line: 'second', allergy: 'yes' });
eq('情境二線過敏：含鉍四合一', s4.primary.id, 'secondBismuthQuadruple');
ok('情境二線過敏：無替代且不含 amoxicillin',
  s4.alternatives.length === 0 && s4.primary.containsAmoxicillin === false);

// 4e. 有潰瘍診斷：複檢走健保 30512C
const s5 = decide({ line: 'first', allergy: 'no', ulcer: 'yes' });
eq('情境有潰瘍：複檢給付 30512C', s5.retest.id, 'ulcer-covered');

// 4f. refractory：轉診、零處方
const s6 = decide({ line: 'refractory', allergy: 'no' });
eq('情境 refractory：outcome=refer', s6.outcome, 'refer');
ok('情境 refractory：無處方、有轉診細節', s6.regimens.length === 0 && !!s6.detail);
ok('情境 refractory：警示包含「切勿重複相同處方」',
  s6.warnings.some(w => w.indexOf('切勿重複相同處方') !== -1));

// 4g. 每條輸出的建議都有「依據與出處」（basis 非空、含事實來源）
['first', 'second'].forEach(line => {
  ['yes', 'no'].forEach(a => {
    const r = decide({ line: line, allergy: a });
    ok(`basis 非空（line=${line} allergy=${a}）`, r.basis.length > 0, r.basis);
    r.basis.forEach(b => {
      ok(`basis source 有 label（${b.id}）`, !!b.label);
    });
  });
});

// ── 4h. 警示不漏接：規則表定義的 bloodAntibody／metronidazoleAlcohol 必須真的出現在輸出裡 ──
console.log('▶ 警示不漏接（回歸測試：曾發生規則表定義了但 decide() 沒 push 的 bug）');
['first', 'second'].forEach(line => {
  ['yes', 'no'].forEach(a => {
    const r = decide({ line: line, allergy: a });
    ok(`warnings 含 bloodAntibody（line=${line} allergy=${a}）`,
      r.warnings.indexOf(RULES.warnings.bloodAntibody) !== -1, r.warnings);
    const hasMetro = r.regimens.some(rg => (rg.drugs || []).some(d => d.name === 'Metronidazole'));
    if (hasMetro) {
      ok(`warnings 含 metronidazoleAlcohol（line=${line} allergy=${a}，處方含 metronidazole）`,
        r.warnings.indexOf(RULES.warnings.metronidazoleAlcohol) !== -1, r.warnings);
    }
  });
});

// ── 5. 完整性：regimens / decisionRules / retest 引用皆存在，無孤兒建議 ──
console.log('▶ 結構完整性');
Object.keys(RULES.regimens).forEach(id => {
  const rg = RULES.regimens[id];
  ok(`regimen ${id} 有 fact 與 sources`, !!rg.fact && Array.isArray(rg.sources));
  rg.sources.forEach(s => ok(`regimen ${id} 引用 source ${s} 存在`, !!RULES.meta.sources[s]));
});

RULES.decisionRules.forEach(rule => {
  eq(`decisionRule ${rule.id}.primary 存在`, !!RULES.regimens[rule.primary], true);
  (rule.alternatives || []).forEach(a =>
    ok(`decisionRule ${rule.id} 替代 ${a} 存在`, !!RULES.regimens[a]));
});

RULES.retest.paymentRules.forEach(p => {
  (p.sources || []).forEach(s => ok(`paymentRule ${p.id} 引用 source ${s} 存在`, !!RULES.meta.sources[s]));
});

// meta.sources 的 id 與檔頭宣告一致
[['retest.timingSource', RULES.retest.timingSource],
 ['retest.stopRuleSource', RULES.retest.stopRuleSource],
 ['retest.methodSource', RULES.retest.methodSource]].forEach(([k, id]) => {
  ok(`${k}（${id}）存在`, !!RULES.meta.sources[id]);
});

(RULES.familyScreening.sources || []).forEach(s =>
  ok(`familyScreening 引用 source ${s} 存在`, !!RULES.meta.sources[s]));

// ── 摘要 ──
console.log(`\n結果：${pass} 通過，${fail} 失敗`);
if (fail > 0) {
  failures.forEach(f => console.log('  ✗ ' + f));
  process.exit(1);
}
console.log('✅ 全部測試通過');