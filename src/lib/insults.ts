// Post-upload banter — private friend-group app, tone requested by the
// user. Odds > 3.0 get the "big balls" treatment, odds <= 1.8 (backing a
// heavy favourite) get mocked for playing it safe, everything else gets a
// generic dig at their gambling ability.

const GENERIC_INSULTS = [
  "{name}, my dead grandmother makes better betting decisions than you, and she's been in the ground six years.",
  "Bold move, {name}. Shame your brain didn't turn up with you today.",
  "{name}, you bet like someone who's never actually watched a football match.",
  "Statistically, {name}, a coin flip would outperform you this season.",
  "{name}, that selection has 'panic-bet after two pints' written all over it.",
  "Another week, another shocking decision from {name}.",
  "{name}, your gambling strategy appears to be 'close eyes, point finger.'",
  "Genuinely impressive, {name} — didn't think you could pick worse than last week.",
  "{name}, bookies see you coming from a mile off.",
  "Someone remind {name} the point is to actually win money.",
  "{name}, this bet has 'refund my fiver' energy.",
  "Confidence is great, {name}, shame it's completely misplaced here.",
  "{name}, even a dartboard would've picked better than this.",
  "The bookies are sending {name} a fruit basket for this one.",
  "{name}, this is the betting equivalent of setting fire to a fiver.",
  "Not sure what {name} was thinking here, and neither is {name}.",
  "{name}, this pick screams 'didn't check the team news.'",
  "Every week {name} finds a new way to disappoint the group.",
  "{name}, at this rate you'll owe the group money by Christmas.",
  "Bless you, {name}. Someone has to finish bottom of the table.",
];

const LOW_ODDS_INSULTS = [
  "Odds of {odds}, {name}? Only a bloke with a two-inch cock plays it that safe.",
  "{name}, backing a nailed-on favourite at {odds} says everything about the size of your dick. Tiny.",
  "That's a coward's bet, {name} — {odds} odds and a matching tiny cock.",
  "{name}, {odds} odds is what you bet when you're compensating for something down south.",
  "Playing it this safe at {odds}, {name}? Bet your cock's the same size as your ambition.",
  "{name}, {odds} odds on a certainty — bold of you to advertise how small it is.",
  "Nothing says 'tiny penis' quite like a {odds} shot, {name}.",
  "{name}, real men take risks. You took {odds}. Draw your own conclusions.",
];

const HIGH_ODDS_INSULTS = [
  "Fucking hell {name}, {odds} odds? Big balls on you, mate.",
  "{name} backing a {odds} shot — either a genius or you've got balls like beach balls.",
  "Respect for the {odds} punt, {name}, absolute unit of a gamble.",
  "{name}, {odds} odds takes serious bollocks. Let's see if the brain matches the balls.",
  "That's a proper set of balls on {name}, going in at {odds}.",
  "{name}, {odds} odds — you've either got balls of steel or you've lost the plot completely.",
  "Massive balls, {name}, absolutely massive, going for {odds}.",
  "{name}, backing {odds} odds is either genius or your balls made a very expensive decision.",
];

function fill(template: string, name: string, odds: number): string {
  return template.replace(/\{name\}/g, name).replace(/\{odds\}/g, odds.toFixed(2));
}

export function pickInsult(userName: string, odds: number): string {
  const pool = odds > 3 ? HIGH_ODDS_INSULTS : odds <= 1.8 ? LOW_ODDS_INSULTS : GENERIC_INSULTS;
  const template = pool[Math.floor(Math.random() * pool.length)];
  return fill(template, userName, odds);
}
