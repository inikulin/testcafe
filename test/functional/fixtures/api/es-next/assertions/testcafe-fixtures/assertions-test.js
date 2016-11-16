// NOTE: to preserve callsites, add new tests AFTER the existing ones
fixture `Assertions`
    .page `http://localhost:3000/fixtures/api/es-next/assertions/pages/index.html`;

test('.eql() assertion', async t => {
    await t
        .expect({ a: 2 }).eql({ a: 2 })
        .expect('hey').eql('yo');
});

test('.notEql() assertion', async t => {
    await t
        .expect({ b: 3 }).notEql({ a: 2 })
        .expect(2).notEql(2);
});

test('.ok() assertion', async t => {
    await t
        .expect({}).ok()
        .expect(false).ok();
});

test('.notOk() assertion', async t => {
    await t
        .expect(false).notOk()
        .expect(1).notOk();
});

test('.contains() assertion', async t => {
    await t
        .expect('heyyo').contains('hey')
        .expect([1, 2, 3]).contains(4);
});

test('.notContains() assertion', async t => {
    await t
        .expect([1, 2, 3]).notContains(4)
        .expect('answer42').notContains('42');
});

test('.typeOf() assertion', async t => {
    await t
        .expect(void 0).typeOf('undefined')
        .expect('hey').typeOf('string')
        .expect(42).typeOf('function');
});

test('.notTypeOf() assertion', async t => {
    await t
        .expect(void 0).notTypeOf('string')
        .expect('hey').notTypeOf('number')
        .expect(42).notTypeOf('number');
});

test('.gt() assertion', async t => {
    await t
        .expect(42).gt(32)
        .expect(42).gt(42);
});

test('.gte() assertion', async t => {
    await t
        .expect(42).gte(32)
        .expect(42).gte(42)
        .expect(42).gte(53);
});

test('.lt() assertion', async t => {
    await t
        .expect(32).lt(42)
        .expect(42).lt(42);
});

test('.lte() assertion', async t => {
    await t
        .expect(32).lte(42)
        .expect(42).lte(42)
        .expect(42).lte(12);
});

test('.within() assertion', async t => {
    await t
        .expect(2.3).within(2, 3)
        .expect(4.5).within(4.6, 7);
});

test('.notWithin() assertion', async t => {
    await t
        .expect(4.5).notWithin(4.6, 7)
        .expect(2.3).notWithin(2, 3);
});
