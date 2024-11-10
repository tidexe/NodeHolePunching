// server.js - 信令服务器
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

app.use(bodyParser.json());

const peers = {}; // 存储连接信息

app.post('/register', (req, res) => {
  const { device_id, port, peer_device_id } = req.body;
  const ip = req.ip;

  // 保存设备的公网IP和端口
  peers[device_id] = { ip, port };

  // 检查是否有配对设备信息
  if (peers[peer_device_id]) {
    const peerInfo = peers[peer_device_id];
    res.json({ status: 'ok', peer_ip: peerInfo.ip, peer_port: peerInfo.port });
  } else {
    res.json({ status: 'waiting' });
  }
});

const PORT = 5000;

// 读取SSL证书和密钥文件
const options = {
  key: fs.readFileSync('/etc/ssl/https/cert.key'), // 替换为你的私钥路径
  cert: fs.readFileSync('/etc/ssl/https/cert.pem') // 替换为你的证书路径
};

// 创建HTTPS服务器
const server = https.createServer(options, app);

server.listen(PORT, () => {
  console.log(`信令服务器正在监听端口 ${PORT}`);
});