'use strict';

const assert = require('node:assert/strict');
const { Readable, Writable } = require('node:stream');
const test = require('node:test');
const { run } = require('../index');

async function runWithInput(input) {
    const chunks = [];
    const output = new Writable({
        write(chunk, encoding, callback) {
            chunks.push(chunk.toString());
            callback();
        },
    });

    await run(Readable.from([input]), output);
    return chunks.join('');
}

test('ACC-001 displays all menu options', async () => {
    const output = await runWithInput('4\n');

    assert.match(output, /1\. View Balance/);
    assert.match(output, /2\. Credit Account/);
    assert.match(output, /3\. Debit Account/);
    assert.match(output, /4\. Exit/);
});

test('ACC-002 reports the initial balance', async () => {
    const output = await runWithInput('1\n4\n');

    assert.match(output, /Current balance: 1000\.00/);
});

test('ACC-003 credits the account and retains the updated balance in-session', async () => {
    const output = await runWithInput('2\n125.50\n1\n4\n');

    assert.match(output, /Amount credited\. New balance: 1125\.50/);
    assert.match(output, /Current balance: 1125\.50/);
});

test('ACC-004 allows a debit less than the available balance', async () => {
    const output = await runWithInput('3\n125.50\n1\n4\n');

    assert.match(output, /Amount debited\. New balance: 874\.50/);
    assert.match(output, /Current balance: 874\.50/);
});

test('ACC-005 allows a debit equal to the available balance', async () => {
    const output = await runWithInput('3\n1000.00\n1\n4\n');

    assert.match(output, /Amount debited\. New balance: 0\.00/);
    assert.match(output, /Current balance: 0\.00/);
});

test('ACC-006 rejects an unaffordable debit without changing the balance', async () => {
    const output = await runWithInput('3\n1000.01\n1\n4\n');

    assert.match(output, /Insufficient funds for this debit\./);
    assert.match(output, /Current balance: 1000\.00/);
});

test('ACC-007 accepts a zero-value credit without changing the balance', async () => {
    const output = await runWithInput('2\n0.00\n1\n4\n');

    assert.match(output, /Amount credited\. New balance: 1000\.00/);
    assert.match(output, /Current balance: 1000\.00/);
});

test('ACC-008 accepts a zero-value debit without changing the balance', async () => {
    const output = await runWithInput('3\n0.00\n1\n4\n');

    assert.match(output, /Amount debited\. New balance: 1000\.00/);
    assert.match(output, /Current balance: 1000\.00/);
});

test('ACC-009 supports the maximum representable balance', async () => {
    const output = await runWithInput('2\n998999.99\n1\n4\n');

    assert.match(output, /Amount credited\. New balance: 999999\.99/);
    assert.match(output, /Current balance: 999999\.99/);
});

test('ACC-010 reports an invalid menu choice and continues', async () => {
    const output = await runWithInput('5\n1\n4\n');

    assert.match(output, /Invalid choice, please select 1-4\./);
    assert.match(output, /Current balance: 1000\.00/);
    assert.equal((output.match(/Account Management System/g) ?? []).length, 3);
});

test('ACC-011 exits with a goodbye message and does not redisplay the menu', async () => {
    const output = await runWithInput('4\n');

    assert.match(output, /Exiting the program\. Goodbye!/);
    assert.equal((output.match(/Account Management System/g) ?? []).length, 1);
});

test('ACC-012 initializes a fresh balance after restarting the application', async () => {
    const firstRun = await runWithInput('2\n125.50\n4\n');
    const restartedRun = await runWithInput('1\n4\n');

    assert.match(firstRun, /Amount credited\. New balance: 1125\.50/);
    assert.match(restartedRun, /Current balance: 1000\.00/);
});
