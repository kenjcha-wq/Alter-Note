/**
 * 插件名称：灵魂对谈 (Soul Link Pro v3.2)
 * 调整内容：增加本地历史缓存，关闭/刷新后记录不丢失；保持药瓶对齐与 enjoy 表情。
 */
(function() {
    const MQTT_CDN = "https://cdn.jsdelivr.net/npm/mqtt/dist/mqtt.min.js";
    const BASE_TOPIC = "alter/soul_link/";
    const MAX_HISTORY = 50; // 最大记忆条数
    
    let state = {
        isMuted: localStorage.getItem('soul_chat_muted') === 'true',
        channelCode: localStorage.getItem('soul_chat_channel') || "",
        isMinimized: true,
        lastTopic: "",
        // 从本地读取历史记录
        history: JSON.parse(localStorage.getItem('soul_chat_cache') || "[]")
    };

    let client = null;
    const myNick = localStorage.getItem('alter_v52_user') || "NIK";

    const soulChatPro = {
        name: "灵魂对谈 (记忆版)",
        author: "Alter Lab",
        run: async function() {
            if (window.SoulChatActive) return AlterAPI.showMsg("频道已在线");

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
            // 初始化时渲染历史记录
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
            const chatWrap = document.createElement('div');
            chatWrap.id = "soul-chat-window";
            chatWrap.style = `
                position: fixed; bottom: 20px; right: 80px; width: 120px; height: 44px;
                background: rgba(20, 20, 20, 0.9); border: 1px solid rgba(255,255,255,0.15); 
                border-radius: 22px; z-index: 1000000; display: flex; flex-direction: column; 
                transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.5); color: #fff; font-family: var(--font-main);
                overflow: hidden;
            `;
            chatWrap.innerHTML = `
                <div id="soul-chat-header" style="padding: 12px 15px; min-height: 44px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; white-space: nowrap;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div id="soul-status-dot" style="width:6px; height:6px; background:#ff4d4f; border-radius:50%;"></div>
                        <span style="font-size: 9px; letter-spacing: 1px; opacity:0.6; font-weight:700;">SOUL 😋</span>
                    </div>
                    <div id="soul-ctrls" style="display:none; gap:12px; align-items:center;">
                        <span id="soul-mute-btn" style="font-size:12px; opacity:0.5;">${state.isMuted ? '🔇' : '🔔'}</span>
                        <span id="soul-min-btn" style="font-size:14px; opacity:0.5;">—</span>
                    </div>
                </div>
                <div id="soul-chat-body" style="display:none; flex-direction:column; flex:1; overflow:hidden;">
                    <div style="padding: 8px 15px; background: rgba(255,255,255,0.02); display: flex; gap: 5px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <input id="soul-channel-code" type="password" placeholder="频率代码" value="${state.channelCode}" style="flex:1; background:transparent; border:none; font-size:10px; color:rgba(255,255,255,0.5); outline:none;">
                        <button id="soul-channel-btn" style="background:rgba(255,255,255,0.1); color:#fff; border:none; padding:2px 8px; border-radius:4px; font-size:9px; cursor:pointer;">切换</button>
                    </div>
                    <div id="soul-messages" style="flex:1; padding:15px; overflow-y:auto; font-size:13px; line-height:1.7; scroll-behavior: smooth;"></div>
                    <div style="padding:12px; background: rgba(0,0,0,0.4); border-top: 1px solid rgba(255,255,255,0.05);">
                        <div style="display:flex; gap:8px;">
                            <input id="soul-input" type="text" placeholder="写下回响..." style="flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:8px 15px; font-size:12px; color:#fff; outline:none;">
                            <button id="soul-send" style="background:#fff; color:#000; border:none; width:45px; height:32px; border-radius:16px; font-size:10px; cursor:pointer; font-weight:700;">同步</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(chatWrap);

            const toggleMin = () => {
                state.isMinimized = !state.isMinimized;
                if (state.isMinimized) {
                    chatWrap.style.width = '120px'; chatWrap.style.height = '44px';
                    chatWrap.style.right = '80px'; chatWrap.style.bottom = '20px';
                    chatWrap.style.borderRadius = '22px';
                    document.getElementById('soul-chat-body').style.display = 'none';
                    document.getElementById('soul-ctrls').style.display = 'none';
                    document.getElementById('soul-status-dot').style.boxShadow = "none";
                } else {
                    chatWrap.style.width = '290px'; chatWrap.style.height = '450px';
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
            document.getElementById('soul-channel-btn').onclick = (e) => { e.stopPropagation(); this.switchChannel(); };
            document.getElementById('soul-send').onclick = () => this.sendMessage();
            document.getElementById('soul-input').onkeydown = (e) => { if(e.key==='Enter') this.sendMessage(); };
        },

        connectMQTT: function() {
            client = mqtt.connect('wss://broker.emqx.io:8084/mqtt', { keepalive: 60, clientId: 'alter_p_' + Math.random().toString(16).substr(2, 6), clean: true });
            client.on('connect', () => {
                document.getElementById('soul-status-dot').style.background = "#52c41a";
                this.switchChannel(true);
            });
            client.on('message', (topic, message) => {
                try {
                    const data = JSON.parse(message.toString());
                    // 核心：存入历史并持久化
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
            msgBox.innerHTML = ""; // 清空当前显示
            state.history.forEach(data => this.appendMessage(data));
        },

        switchChannel: function(isInit = false) {
            const code = document.getElementById('soul-channel-code').value.trim();
            const newTopic = BASE_TOPIC + (code ? "private/" + code : "public_void_v1");
            if (!isInit && state.lastTopic) client.unsubscribe(state.lastTopic);
            
            // 如果频道变了，清空本地缓存的历史记录（可选，此处保留以防误触）
            if (!isInit && state.channelCode !== code) {
                state.history = [];
                localStorage.setItem('soul_chat_cache', "[]");
            }

            state.channelCode = code;
            state.lastTopic = newTopic;
            localStorage.setItem('soul_chat_channel', code);
            client.subscribe(newTopic);
            this.renderHistory();
            const mb = document.getElementById('soul-messages');
            if(mb) mb.insertAdjacentHTML('beforeend', `<div style="text-align:center; opacity:0.2; font-size:9px; margin: 10px 0;">CHANNEL: ${code || 'PUBLIC'}</div>`);
        },

        sendMessage: function() {
            const input = document.getElementById('soul-input');
            const text = input.value.trim();
            if (!text || !client) return;
            client.publish(state.lastTopic, JSON.stringify({ user: myNick, text: text, time: Date.now() }));
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

    if (window.AlterPlugins) {
        AlterPlugins.register(soulChatPro);
    }
})();


