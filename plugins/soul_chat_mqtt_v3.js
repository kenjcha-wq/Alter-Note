/**
 * 插件名称：灵魂对谈 (Soul Link Pro v3.4)
 * 修复点：
 * 1. 增加【自启动】逻辑：执行一次后，刷新/重开页面将自动挂载。
 * 2. 强化【断线重连】：解决手机锁屏导致的 WebSocket 断开和丢包。
 * 3. 保持药瓶对齐、enjoy 表情、本地缓存历史。
 */
(function() {
    const MQTT_CDN = "https://cdn.jsdelivr.net/npm/mqtt/dist/mqtt.min.js";
    const BASE_TOPIC = "alter/soul_link/";
    const MAX_HISTORY = 50; 
    
    // 唯一设备指纹，用于服务器 Session 恢复
    let deviceId = localStorage.getItem('soul_chat_device_id');
    if (!deviceId) {
        deviceId = 'alter_v34_' + Math.random().toString(16).substr(2, 8);
        localStorage.setItem('soul_chat_device_id', deviceId);
    }

    let state = {
        isMuted: localStorage.getItem('soul_chat_muted') === 'true',
        channelCode: localStorage.getItem('soul_chat_channel') || "",
        isMinimized: localStorage.getItem('soul_chat_minimized') !== 'false', // 默认收起
        lastTopic: "",
        history: JSON.parse(localStorage.getItem('soul_chat_cache') || "[]")
    };

    let client = null;
    const myNick = localStorage.getItem('alter_v52_user') || "NIK";

    const soulChatPro = {
        name: "灵魂对谈 (终极版)",
        author: "Alter Lab",
        run: async function() {
            if (window.SoulChatActive) return;

            // 标记为活跃状态，实现下次开启笔记本时自启动
            localStorage.setItem('soul_chat_persistent_active', 'true');

            if (typeof mqtt === 'undefined') {
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = MQTT_CDN;
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
            }

            this.buildUI();
            this.connectMQTT();
            this.renderHistory();
            window.SoulChatActive = true;
        },

        playAlert: function() {
            if (state.isMuted) return;
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime); 
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(); osc.stop(ctx.currentTime + 0.2);
            } catch (e) {}
        },

        buildUI: function() {
            if (document.getElementById('soul-chat-window')) return;
            const chatWrap = document.createElement('div');
            chatWrap.id = "soul-chat-window";
            
            // 初始样式设置（根据最小化状态）
            const isMin = state.isMinimized;
            chatWrap.style = `
                position: fixed; z-index: 1000000; display: flex; flex-direction: column; 
                background: rgba(15, 15, 15, 0.95); border: 1px solid rgba(255,255,255,0.15); 
                transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
                box-shadow: 0 20px 50px rgba(0,0,0,0.6); color: #fff; font-family: var(--font-main);
                overflow: hidden;
                bottom: ${isMin ? '20px' : '85px'};
                right: ${isMin ? '80px' : '15px'};
                width: ${isMin ? '120px' : '290px'};
                height: ${isMin ? '44px' : '480px'};
                border-radius: ${isMin ? '22px' : '16px'};
            `;

            chatWrap.innerHTML = `
                <div id="soul-chat-header" style="padding: 12px 15px; min-height: 44px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; white-space: nowrap;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div id="soul-status-dot" style="width:6px; height:6px; background:#ff4d4f; border-radius:50%;"></div>
                        <span style="font-size: 9px; letter-spacing: 1px; opacity:0.6; font-weight:700;">SOUL 😋</span>
                    </div>
                    <div id="soul-ctrls" style="display:${isMin ? 'none' : 'flex'}; gap:12px; align-items:center;">
                        <span id="soul-mute-btn" style="font-size:12px; opacity:0.5;">${state.isMuted ? '🔇' : '🔔'}</span>
                        <span id="soul-close-x" style="font-size:18px; opacity:0.3; margin-left:5px;">&times;</span>
                    </div>
                </div>
                <div id="soul-chat-body" style="display:${isMin ? 'none' : 'flex'}; flex-direction:column; flex:1; overflow:hidden;">
                    <div style="padding: 8px 15px; background: rgba(255,255,255,0.02); display: flex; gap: 5px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <input id="soul-channel-code" type="password" placeholder="频率" value="${state.channelCode}" style="flex:1; background:transparent; border:none; font-size:10px; color:rgba(255,255,255,0.5); outline:none;">
                        <button id="soul-channel-btn" style="background:rgba(255,255,255,0.1); color:#fff; border:none; padding:2px 8px; border-radius:4px; font-size:9px; cursor:pointer;">切换</button>
                    </div>
                    <div id="soul-messages" style="flex:1; padding:15px; overflow-y:auto; font-size:13px; line-height:1.7; scroll-behavior: smooth;"></div>
                    <div style="padding:12px; background: rgba(0,0,0,0.4); border-top: 1px solid rgba(255,255,255,0.05);">
                        <div style="display:flex; gap:8px;">
                            <input id="soul-input" type="text" placeholder="此时此地..." style="flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:8px 15px; font-size:12px; color:#fff; outline:none;">
                            <button id="soul-send" style="background:#fff; color:#000; border:none; width:48px; height:32px; border-radius:16px; font-size:10px; cursor:pointer; font-weight:700;">同步</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(chatWrap);

            // 事件绑定
            const toggleMin = () => {
                state.isMinimized = !state.isMinimized;
                localStorage.setItem('soul_chat_minimized', state.isMinimized);
                if (state.isMinimized) {
                    chatWrap.style.width = '120px'; chatWrap.style.height = '44px';
                    chatWrap.style.right = '80px'; chatWrap.style.bottom = '20px';
                    chatWrap.style.borderRadius = '22px';
                    document.getElementById('soul-chat-body').style.display = 'none';
                    document.getElementById('soul-ctrls').style.display = 'none';
                    document.getElementById('soul-status-dot').style.boxShadow = "none";
                } else {
                    chatWrap.style.width = '290px'; chatWrap.style.height = '480px';
                    chatWrap.style.right = '15px'; chatWrap.style.bottom = '85px';
                    chatWrap.style.borderRadius = '16px';
                    document.getElementById('soul-chat-body').style.display = 'flex';
                    document.getElementById('soul-ctrls').style.display = 'flex';
                    const mb = document.getElementById('soul-messages');
                    if(mb) mb.scrollTop = mb.scrollHeight;
                }
            };

            document.getElementById('soul-chat-header').onclick = toggleMin;
            
            document.getElementById('soul-mute-btn').onclick = (e) => {
                e.stopPropagation(); state.isMuted = !state.isMuted;
                localStorage.setItem('soul_chat_muted', state.isMuted);
                e.target.innerText = state.isMuted ? '🔇' : '🔔';
            };

            document.getElementById('soul-close-x').onclick = (e) => {
                e.stopPropagation();
                localStorage.setItem('soul_chat_persistent_active', 'false');
                if(client) client.end();
                chatWrap.remove();
                window.SoulChatActive = false;
                AlterAPI.showMsg("频道已彻底关闭");
            };

            document.getElementById('soul-channel-btn').onclick = (e) => { e.stopPropagation(); this.switchChannel(); };
            document.getElementById('soul-send').onclick = () => this.sendMessage();
            document.getElementById('soul-input').onkeydown = (e) => { if(e.key==='Enter') this.sendMessage(); };
        },

        connectMQTT: function() {
            // 配置高稳定性连接选项
            const options = { 
                keepalive: 30, 
                clientId: deviceId, 
                clean: false, // 启用持久化 Session
                reconnectPeriod: 1000,
                connectTimeout: 5000
            };
            
            client = mqtt.connect('wss://broker.emqx.io:8084/mqtt', options);
            
            client.on('connect', () => {
                document.getElementById('soul-status-dot').style.background = "#52c41a";
                document.getElementById('soul-status-dot').style.boxShadow = "0 0 5px #52c41a";
                this.switchChannel(true);
            });

            client.on('offline', () => {
                document.getElementById('soul-status-dot').style.background = "#ff4d4f";
                document.getElementById('soul-status-dot').style.boxShadow = "none";
            });

            client.on('message', (topic, message) => {
                try {
                    const data = JSON.parse(message.toString());
                    // 严格查重，防止由于 QoS 1 重试导致的重复显示
                    const isDup = state.history.some(h => Math.abs(h.time - data.time) < 100 && h.user === data.user && h.text === data.text);
                    if (isDup) return;

                    state.history.push(data);
                    if(state.history.length > MAX_HISTORY) state.history.shift();
                    localStorage.setItem('soul_chat_cache', JSON.stringify(state.history));
                    
                    this.appendMessage(data);
                    if (data.user !== myNick) {
                        this.playAlert();
                        if (state.isMinimized) {
                            document.getElementById('soul-status-dot').style.background = "#1890ff";
                            document.getElementById('soul-status-dot').style.boxShadow = "0 0 10px #1890ff";
                        }
                    }
                } catch(e) {}
            });
        },

        renderHistory: function() {
            const msgBox = document.getElementById('soul-messages');
            if(!msgBox) return;
            msgBox.innerHTML = ""; 
            state.history.forEach(data => this.appendMessage(data));
        },

        switchChannel: function(isInit = false) {
            const code = document.getElementById('soul-channel-code').value.trim();
            const newTopic = BASE_TOPIC + (code ? "private/" + code : "public_void_v1");
            
            if (!isInit && state.lastTopic) client.unsubscribe(state.lastTopic);
            
            if (!isInit && state.channelCode !== code) {
                state.history = [];
                localStorage.setItem('soul_chat_cache', "[]");
                document.getElementById('soul-messages').innerHTML = "";
            }

            state.channelCode = code;
            state.lastTopic = newTopic;
            localStorage.setItem('soul_chat_channel', code);
            
            client.subscribe(newTopic, { qos: 1 });
            const mb = document.getElementById('soul-messages');
            if(mb) mb.insertAdjacentHTML('beforeend', `<div style="text-align:center; opacity:0.1; font-size:8px; margin: 10px 0;">--- ${code ? 'PRIVATE' : 'PUBLIC'} LINKED ---</div>`);
            mb.scrollTop = mb.scrollHeight;
        },

        sendMessage: function() {
            const input = document.getElementById('soul-input');
            const text = input.value.trim();
            if (!text || !client) return;
            client.publish(state.lastTopic, JSON.stringify({ user: myNick, text: text, time: Date.now() }), { qos: 1 });
            input.value = "";
        },

        appendMessage: function(data) {
            const msgBox = document.getElementById('soul-messages');
            if(!msgBox) return;
            const msgDiv = document.createElement('div');
            msgDiv.style.marginBottom = "15px";
            const isMe = data.user === myNick;
            msgDiv.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items: ${isMe ? 'flex-end' : 'flex-start'};">
                    <span style="opacity:0.3; font-size:8px; margin-bottom:4px;">@${data.user}</span>
                    <div style="background: ${isMe ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}; 
                                padding: 8px 12px; border-radius: 12px; 
                                border-${isMe ? 'right' : 'left'}: 2px solid rgba(255,255,255,0.3);
                                max-width: 90%; word-break: break-all; font-size:12px;">
                        ${data.text}
                    </div>
                </div>
            `;
            msgBox.appendChild(msgDiv);
            msgBox.scrollTop = msgBox.scrollHeight;
        }
    };

    // 核心改进：注册后检查是否需要自启动
    if (window.AlterPlugins) {
        AlterPlugins.register(soulChatPro);
        // 如果本地记录为活跃状态，立即运行，实现刷新自动加载
        if (localStorage.getItem('soul_chat_persistent_active') === 'true') {
            setTimeout(() => soulChatPro.run(), 100);
        }
    }
})();

