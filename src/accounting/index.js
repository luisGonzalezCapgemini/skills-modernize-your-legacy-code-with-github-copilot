'use strict';

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const INITIAL_BALANCE_CENTS = 100_000;
const MAX_AMOUNT_CENTS = 99_999_999;

function parseAmount(input) {
    const match = input.trim().match(/^(\d+)(?:\.(\d{1,2}))?$/);
    if (!match) {
        return null;
    }

    const cents = BigInt(match[1]) * 100n + BigInt((match[2] ?? '').padEnd(2, '0') || '0');
    return cents <= BigInt(MAX_AMOUNT_CENTS) ? Number(cents) : null;
}

function formatBalance(cents) {
    const dollars = Math.floor(cents / 100);
    const remainder = String(cents % 100).padStart(2, '0');
    return `${dollars}.${remainder}`;
}

async function ask(input, output, prompt) {
    output.write(prompt);
    const result = await input.next();
    return result.done ? null : result.value;
}

async function askForAmount(input, output, operation) {
    while (true) {
        const value = await ask(input, output, `Enter ${operation} amount: `);
        if (value === null) {
            return null;
        }

        const amount = parseAmount(value);
        if (amount !== null) {
            return amount;
        }
        output.write('Invalid amount. Enter a non-negative amount with up to two decimal places, not exceeding 999999.99.\n');
    }
}

async function run(inputStream = stdin, outputStream = stdout) {
    const rl = readline.createInterface({ input: inputStream, crlfDelay: Infinity });
    const input = rl[Symbol.asyncIterator]();
    let balance = INITIAL_BALANCE_CENTS;
    let keepRunning = true;
    let exitChosen = false;

    try {
        while (keepRunning) {
            const choice = await ask(input, outputStream, [
                '--------------------------------',
                'Account Management System',
                '1. View Balance',
                '2. Credit Account',
                '3. Debit Account',
                '4. Exit',
                '--------------------------------',
                'Enter your choice (1-4): ',
            ].join('\n'));

            if (choice === null) {
                break;
            }
            switch (choice.trim()) {
                case '1':
                    outputStream.write(`Current balance: ${formatBalance(balance)}\n`);
                    break;
                case '2': {
                    const amount = await askForAmount(input, outputStream, 'credit');
                    if (amount === null) {
                        keepRunning = false;
                        break;
                    }
                    if (amount > MAX_AMOUNT_CENTS - balance) {
                        outputStream.write('Credit exceeds the maximum balance of 999999.99.\n');
                        break;
                    }
                    balance += amount;
                    outputStream.write(`Amount credited. New balance: ${formatBalance(balance)}\n`);
                    break;
                }
                case '3': {
                    const amount = await askForAmount(input, outputStream, 'debit');
                    if (amount === null) {
                        keepRunning = false;
                        break;
                    }
                    if (balance >= amount) {
                        balance -= amount;
                        outputStream.write(`Amount debited. New balance: ${formatBalance(balance)}\n`);
                    } else {
                        outputStream.write('Insufficient funds for this debit.\n');
                    }
                    break;
                }
                case '4':
                    keepRunning = false;
                    exitChosen = true;
                    break;
                default:
                    outputStream.write('Invalid choice, please select 1-4.\n');
            }
        }
    } finally {
        rl.close();
    }

    if (exitChosen) {
        outputStream.write('Exiting the program. Goodbye!\n');
    }
}

module.exports = { run };

if (require.main === module) {
    run().catch((error) => {
        console.error('Unable to run the accounting application:', error);
        process.exitCode = 1;
    });
}
