var languages = ['CN','CZ','DE','EN','ES','FR','IT','JP','KR','PL','RU','UA'];

var menu = [
  'Creature','Prefix','Suffix','Charm/Relic','Set',0,
  'Head','Torso','Leg','Arm','Ring','Amulet','Artifact',0,
  'Axe','Bow','Club','Shield','Spear','Staff','Sword','Throwing',0,
  'Head...Throwing'
];

var req     = ['strength','dexterity','intelligence','level'];
var mastery = ['Defense','Dream','Earth','Hunting','Nature','Neidan','Rogue','Rune','Spirit','Storm','Warfare'];
var resEle  = ['Cold','Fire','Lightning'];
var resPri  = resEle.concat(['Bleeding','Physical','Pierce','Poison','Vitality']);

var filters = `
  <div>
    <label>
      Name: <input id="byName" placeholder="" oninput="filter()">
    </label>

    <label style="display:inline-block">
      Properties:
      <input id="byProperties"    placeholder="RegExp;RegExp\\n" oninput="filter()">
      <input id="byPropertiesNot" placeholder="(exclude)"        oninput="filter()">
      <div style="position:absolute;margin-top:4px;font:12px Arial;color:#800"></div>
    </label>

    <span>
      ` +
        req.map(s => `
          <label>
            req:${s.slice(0,3).replace('lev','lvl')}
            <select id="byReq${s}" onchange="filter()">
              <option></option>
              ` + Array(6).fill().map((_,i) => (i+1) * (s == 'level' ? 10 : 100)).map(_ => `<option value="${_}">&lt;=${_}</option>`).join('') + `
            </select>
          </label>
        `).join('') +
      `
    </span>
  </div>

  <div>
    +All Skills in:
    <div>
      ` +
        mastery.map(s => `
          <label>
            ${s}
            <select id="bySkill${s}" onchange="filter()">
              <option></option>
              ` + Array(4).fill().map((_,i) => (i+1)).map(_ => `<option value="${_}">&gt;=${_}</option>`).join('') + `
            </select>
          </label>
        `).join('') +
      `
    </div>
  </div>

  <div>
    Resistance:
    <div>
      ` +
        resPri.concat('Sum').map(s => `
          <label>
            ${s}
            <select id="byResPri${s}" onchange="filter()">
              <option></option>
              ` + Array(9).fill().map((_,i) => (i+1) * (s == 'Sum' ? 20 : 10)).map(_ => `<option value="${_}">&gt;=${_}</option>`).join('') + `
            </select>
          </label>
        `).join('') +
      `
    </div>
  </div>

  <div>
    <label>
      Rarity
      <select id="byRarity" style="width:10em" onchange="filter()">
        <option></option>
        ` + ['Magical','Rare','Epic','Legendary'].map(_ => `<option class="${_}" value="${_}"></option>`).join('') + `
      </select>
    </label>
    <label>
      DLC
      <select id="byX" onchange="filter()">
        <option></option>
        <option value="1">(Base Game)</option>
        <option value="2">Ragnarök</option>
        <option value="3">Atlantis</option>
        <option value="4">Eternal Embers</option>
      </select>
    </label>
    <label><input id="byGrantSkill" type="checkbox" onchange="filter()"> Grants Skill</label>
    <label><input id="byPetBonus"   type="checkbox" onchange="filter()"> Pet Bonus</label>
    <label><input id="byInvert"     type="checkbox" onchange="filter()"> Invert</label>
    <label><input id="byBookmark"   type="checkbox" onchange="filter()"> 🔖</label>
    <label><button id="reset" onclick="document.body.querySelectorAll('nav~* input, nav~* select').forEach(_ => _.checked = _.value = ''); filter()">Reset</button></label>
    <label>Found: <span class="count"></span></label>
  </div>
`;

var isBad = (e,p) => {
  var bad = 0;
  bad |= byPetBonus  .checked && !p.petBonus;
  bad |= byGrantSkill.checked && !p.grantSkill;
  bad |= byX         .value   && e._.x != byX.value;
  return bad;
};

var loaded = _=>_;

var reqText = _ => (
  _.level ?
  ('lvl ' + _.level) :
  ('req:'
    + (_.strengthRequirement     ? '   str ' + _.strengthRequirement     : '')
    + (_.dexterityRequirement    ? '   dex ' + _.dexterityRequirement    : '')
    + (_.intelligenceRequirement ? '   int ' + _.intelligenceRequirement : '')
    + (_.levelRequirement        ? '   lvl ' + _.levelRequirement        : '')
  ).replace(/^req:$/,'')
);

var bookmark = 'bookmark';
var subColor = '#0004';
var orColor  = '#bbb';

var home = [{
  name: 'Welcome to the Titan Quest Database',
  type: ' ',
  properties: {a:[
    'Data source:',
    '•  https://tq-db.net/',
  ]}
}];
