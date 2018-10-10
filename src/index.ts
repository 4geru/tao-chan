import { Client, SpeechBuilder, Middleware } from '@line/clova-cek-sdk-nodejs';
import * as express from 'express';
import { Client as PostgresClient } from 'pg';

const postgres = new PostgresClient({
          connectionString: 'postgres://ckhojlvptsccke:4c48adcffc1247812de0e1ac6985fd1bd129310f3da567d0019cf82b0dc2aa8b@ec2-184-72-234-230.compute-1.amazonaws.com:5432/d20frin1sr7g6u',
          ssl: true,
});

const app = express();

postgres.connect();

const launchHandler = async responseHelper => {
  responseHelper.setSimpleSpeech(
    SpeechBuilder.createSpeechText('おはよう')
  );
};

const intentHandler = async responseHelper => {
  const intent = responseHelper.getIntentName();
  const sessionId = responseHelper.getSessionId();
  saveUserId(responseHelper.getUser().userId);
  console.log(responseHelper.getUser().userId)
  console.log(intent == 'remaining_towel')
  switch (intent) {
    case 'remaining_towel':
      responseHelper.setSimpleSpeech(
        SpeechBuilder.createSpeechText('明日洗濯しよう！')
      );
      break;
    case 'used_towel':
      responseHelper.setSimpleSpeech(
        SpeechBuilder.createSpeechText('タオル使ったんだね')
      );
      break;
    default:
      responseHelper.setSimpleSpeech(
        SpeechBuilder.createSpeechText('なんなん')
      );
      break;
  }
};

const sessionEndedHandler = async responseHelper => { };

  const clovaHandler: any = Client
    .configureSkill()
    .onLaunchRequest(launchHandler)
    .onIntentRequest(intentHandler)
    .onSessionEndedRequest(sessionEndedHandler)
    .handle();

const clovaMiddleware = Middleware({ applicationId: 'com.4geru.tao' });

app.post('/clova', clovaMiddleware, clovaHandler);

const port = process.env.PORT || 2000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

const saveUserId = (userId) => {
  const sql = `INSERT INTO users (user_id) VALUES('${userId}') RETURNING *`;
  postgres.query(sql, (err, res) => {
    console.log(err ? `already inserted user_id ${userId}` : res.rows[0])
  })
}