var _ = require('underscore');

const partyName = [
    'The Chunky Monkey',
    'Farming',
    '126th Street',
    'Dragon Claws',
    'Rabbits Foot',
    'Mathematical',
    'The Motherhood',
    'Professors',
    'Interstellar',
    'The Human',
    'Robotics',
    'The Belly Beasts',
    'The Donkey',
    'Sleazeballs',
    'Garbanzo Beans',
    'We Hate Cats',
    'We Hate Dogs',
    ''
];

const partyTitle = [
    'Association',
    'Campaign',
    'Lobby',
    'Advocacy',
    'Party',
    'Society',
    'Coalition',
    'Movement',
    'Alliance',
    'Foundation',
    'Campaign',
    'Roundtable',
    'Club',
    'Council',
    'Institute',
    'Project',
    'Committee',
    'Legislation',
    'Forum',
    'Trust',
    'Service',
    'Mission',
    'Network',
    'League',
    'Union',
    'Forces',
    'Mafia',
    'Syndicate',
    'Mob',
    'Cartel',
    'Circle',
    'Organization',
    'Legion',
    'Pirates',
];

function returnRandomPartyName(){
    return  _.sample(partyName) + ' ' + _.sample(partyTitle);
};

module.exports = {
    returnRandomPartyName: returnRandomPartyName,
};
