# COBOL Account Management Test Plan

This plan describes the behavior implemented by the current COBOL application.
Run each case in a fresh application process unless the preconditions say to
continue a prior case. A fresh process initializes the in-memory balance to
`1000.00`. Enter amounts as nonnegative values with up to two decimal places.

The program does not define business validation for negative, malformed, or
out-of-range amounts, or for credits that exceed the balance field's capacity.
Agree on those policies with stakeholders before treating such inputs as
acceptance criteria for the Node.js version. Balance and amount fields are
`PIC 9(6)V99` (up to `999999.99`); the COBOL source does not explicitly format
the implied decimal point in displayed values.

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| ACC-001 | Display the account menu | Application has started in a fresh process. | 1. Observe the menu before entering a choice. | The menu displays View Balance, Credit Account, Debit Account, and Exit with choices 1 through 4. | Not run |  |  |
| ACC-002 | View the initial balance | Fresh application process; no account operation has been performed. | 1. Choose `1`.<br>2. Observe the reported balance. | The current balance is reported as `1000.00` (the displayed numeric formatting may not show a decimal point). | Not run |  |  |
| ACC-003 | Credit an account and retain the result during the session | Fresh application process; starting balance is `1000.00`. | 1. Choose `2` and enter `125.50`.<br>2. Choose `1` to view the balance. | The credit is reported successful; the resulting balance is `1125.50`. The subsequent view reports the same balance. | Not run |  |  |
| ACC-004 | Debit less than the available balance | Fresh application process; starting balance is `1000.00`. | 1. Choose `3` and enter `125.50`.<br>2. Choose `1` to view the balance. | The debit is reported successful; the resulting and subsequently reported balance is `874.50`. | Not run |  |  |
| ACC-005 | Debit exactly the available balance | Fresh application process; starting balance is `1000.00`. | 1. Choose `3` and enter `1000.00`.<br>2. Choose `1` to view the balance. | The debit is allowed because the balance is equal to the debit amount. The resulting balance is `0.00`. | Not run |  |  |
| ACC-006 | Reject a debit greater than the available balance | Fresh application process; starting balance is `1000.00`. | 1. Choose `3` and enter `1000.01`.<br>2. Choose `1` to view the balance. | An insufficient-funds message is displayed. The balance is not changed and is still `1000.00`. | Not run |  |  |
| ACC-007 | Credit a zero amount | Fresh application process; starting balance is `1000.00`. | 1. Choose `2` and enter `0.00`.<br>2. Choose `1` to view the balance. | The current implementation reports the credit successful and leaves the balance at `1000.00`. | Not run |  | Confirm with stakeholders whether zero-value credits should be allowed. |
| ACC-008 | Debit a zero amount | Fresh application process; starting balance is `1000.00`. | 1. Choose `3` and enter `0.00`.<br>2. Choose `1` to view the balance. | The current implementation reports the debit successful and leaves the balance at `1000.00`. | Not run |  | Confirm with stakeholders whether zero-value debits should be allowed. |
| ACC-009 | Reach the maximum representable balance | Fresh application process; starting balance is `1000.00`. | 1. Choose `2` and enter `998999.99`.<br>2. Choose `1` to view the balance. | The resulting balance is `999999.99`, the maximum value representable by the balance field. | Not run |  | Confirms an in-range boundary only; behavior beyond the field capacity is unspecified. |
| ACC-010 | Handle an invalid menu choice and continue | Application is displaying the menu. | 1. Enter `5`.<br>2. At the next menu prompt, choose `1`. | An invalid-choice message is displayed; the menu is shown again and the valid View Balance choice works. | Not run |  |  |
| ACC-011 | Exit the application | Application is displaying the menu. | 1. Choose `4`.<br>2. Observe the output and whether another menu is displayed. | A goodbye message is displayed and the application stops without displaying another menu. | Not run |  |  |
| ACC-012 | Confirm balance lifetime across process restart | Complete ACC-003 in one process, then start a new process. | 1. In the first process, credit `125.50`.<br>2. Exit and restart the application.<br>3. Choose `1`. | The first process holds `1125.50` after the credit. After restart, the balance is initialized again to `1000.00`; account data is not persisted. | Not run |  | Current implementation stores the balance in memory only. |
