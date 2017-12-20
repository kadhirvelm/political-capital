var catalog = require('../Routes/Catalog.js');

it('Tests the random party name generator', () => {
    const randomName = catalog.returnRandomPartyName();
    expect(randomName).not.toBeUndefined();
});
