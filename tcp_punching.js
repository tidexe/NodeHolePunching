// tcp_punching.js
const net = require('net');
const axios = require('axios');

// 向信令服务器注册并获取对方的公网信息
async function registerWithSignalingServer(device_id, peer_device_id, port) {
  try {
    const response = await axios.post('https://hcss.tidex.zone:5000/register', {
      device_id,
      peer_device_id,
      port,
    });
    return response.data;
  } catch (error) {
    console.error('注册失败:', error);
    return null;
  }
}

// 尝试建立连接
async function tcpPunching(device_id, peer_device_id, local_port) {
  // 向信令服务器注册并等待对方信息
  let peerInfo = await registerWithSignalingServer(device_id, peer_device_id, local_port);
  while (peerInfo.status !== 'ok') {
    console.log('等待对方注册...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    peerInfo = await registerWithSignalingServer(device_id, peer_device_id, local_port);
  }

  const peer_ip = peerInfo.peer_ip;
  const peer_port = peerInfo.peer_port;
  console.log(`获取对方信息 - IP: ${peer_ip}, 端口: ${peer_port}`);

  // 创建本地监听
  const server = net.createServer((socket) => {
    console.log('打洞成功，连接建立');
    socket.on('data', (data) => console.log('接收到数据:', data.toString()));
  });
  server.listen(local_port);

  // 同时尝试连接对方
  const client = new net.Socket();
  client.connect(peer_port, peer_ip, () => {
    console.log(`连接到对方 ${peer_ip}:${peer_port}`);
    client.write('Hello from client');
  });
}

// 运行客户端和无公网服务器
const device_id = 'client'; // 'server' 在无公网服务器端
const peer_device_id = 'server'; // 'client' 在客户端
const local_port = 12345;

tcpPunching(device_id, peer_device_id, local_port);
