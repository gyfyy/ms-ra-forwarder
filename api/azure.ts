import axios from 'axios';
import { Request, Response } from 'express';

// 替换为您的Azure TTS服务密钥和区域
const AZURE_TTS_KEY = '4ee35e879d0f4d968b3c24ece7ae5a40';
const AZURE_REGION = 'eastasia';

module.exports = async (request: Request, response: Response) => {
  try {
    if (request.method === 'GET') {
      // 获取Azure TTS声音列表
      const listResponse = await axios.get(
        `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1/voices/list`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': AZURE_TTS_KEY,
          },
        }
      );

      const data = listResponse.data;
      if (!data) {
        console.error('获取声音列表失败');
        response.status(500).json('获取声音列表失败');
        return;
      }

      response
        .status(200)
        .setHeader('Content-Type', 'application/json; charset=utf-8')
        .json(data);
    } else {
      console.debug(`请求正文：${request.body}`);

      // 在此处处理文本到语音转换请求
      // 使用 Azure TTS 服务将 ssml 转换为音频并返回

      const ssml = request.body;
      const format = 'audio-16khz-128kbitrate-mono-mp3'; // 设置音频格式
      const ttsResponse = await axios.post(
        `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
        ssml,
        {
          headers: {
            'Content-Type': 'application/ssml+xml',
            'Ocp-Apim-Subscription-Key': AZURE_TTS_KEY,
            'X-Microsoft-OutputFormat': format,
            'User-Agent': 'yd',
          },
          responseType: 'arraybuffer',
        }
      );

      // 处理 ttsResponse 并将结果返回给客户端
      const audioData = ttsResponse.data;

      if (!audioData) {
        console.error('语音转换失败');
        response.status(500).json('语音转换失败');
        return;
      }

      // 返回音频数据
      response
        .status(200)
        .setHeader('Content-Type', 'audio/mpeg')
        .send(audioData);
    }
  } catch (error) {
    console.error(`发生错误, ${error.message}`);
    response.status(503).json(error);
  }
};
