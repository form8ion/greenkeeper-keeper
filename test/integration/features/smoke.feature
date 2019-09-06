Feature: Smoke test

  Scenario: the server starts successfully
    Given the webhook is signed
    When a webhook is received
    Then a response is sent

  Scenario: an unsigned webhook is rejected
    When a webhook is received
    Then an unauthorized response is sent
