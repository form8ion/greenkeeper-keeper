import crypto from 'crypto';
import {BAD_REQUEST, UNAUTHORIZED} from 'http-status-codes';
import {After, AfterAll, BeforeAll, Given, Then, When} from 'cucumber';
import {assert} from 'chai';
import any from '@travi/any';

let server, serverResponse, signature;
const payload = any.simpleObject();
const githubSecret = any.string();

BeforeAll(async () => {
  process.env.GITHUB_TOKEN = any.string();
  process.env.GITHUB_WEBHOOK_SECRET = githubSecret;
  process.env.PORT = 8888;

  // this is the bundled version of the app, which is built after linting happens
  // eslint-disable-next-line  import/no-unresolved
  server = await require('../../../../lib/server').default;
});

Given('the webhook is signed', function () {
  const hmac = crypto.createHmac('sha1', githubSecret);
  hmac.setEncoding('hex');
  hmac.write(Buffer.from(JSON.stringify(payload)));
  hmac.end();
  signature = `sha1=${hmac.read()}`;
});

When('a webhook is received', async function () {
  serverResponse = await server.inject({
    method: 'POST',
    url: '/payload',
    payload,
    ...signature && {headers: {'X-Hub-Signature': signature}}
  });
});

Then('a response is sent', function () {
  assert.equal(serverResponse.statusCode, BAD_REQUEST);
});

Then('an unauthorized response is sent', function () {
  assert.equal(serverResponse.statusCode, UNAUTHORIZED);
});

After(() => {
  signature = null;
});

AfterAll(async () => {
  await server.stop();
});
