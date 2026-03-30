/**
 * 插件名称：意识脉络：关键词生成器 & 视觉重塑
 * 功能：
 * 1. 自动从当前笔记中提取认知关键词（意识标签）。
 * 2. 优化“天象指示器”的视觉效果，替换“丑太阳”。
 */
(function() {
    const keywordPlugin = {
        name: "意识脉络提取器",
        author: "Alter Lab",
        run: function() {
            const editor = document.getElementById('note-in');
            if (!editor || !editor.value.trim()) {
                AlterAPI.showMsg("编辑器空空如也，无从感应脉络");
                return;
            }

            const text = editor.value;
            // 1. 简单的关键词提取逻辑（分词并过滤短词）
            const words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()！？。，、]/g, " ")
                             .split(/\s+/)
                             .filter(w => w.length >= 2); // 过滤单字

            if (words.length === 0) {
                AlterAPI.showMsg("内容太简短，无法捕捉脉络");
                return;
            }

            // 2. 统计词频
            const counts = {};
            words.forEach(w => counts[w] = (counts[w] || 0) + 1);

            // 3. 排序并取前 3 个关键词
            const sorted = Object.entries(counts)
                                 .sort((a, b) => b[1] - a[1])
                                 .slice(0, 3)
                                 .map(item => `#${item[0]}`);

            const result = sorted.join("  ");
            
            // 4. 反馈给用户
            AlterAPI.showMsg(`意识锚点：${result}`);
            
            // 顺便在控制台打印深度报告
            console.log("%c [意识脉络报告] ", "background:#000; color:#fff", {
                tags: sorted,
                wordCount: text.length,
                timestamp: new Date().toLocaleTimeString()
            });
        }
    };

    // --- 视觉重塑逻辑（针对你觉得丑的太阳） ---
    const reshapeUI = () => {
        const style = document.createElement('style');
        style.textContent = `
            /* 替换原有太阳图标的显示效果 */
            .emotion-clarity { 
                background: radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.05) 100%) !important;
                border-color: rgba(255, 215, 0, 0.4) !important;
                color: #daa520 !important;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.2) !important;
            }
            /* 强制替换图标内容（如果当前是澄明状态） */
            .philosophy-emotion-indicator.emotion-clarity {
                font-family: serif !important;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            }
        `;
        document.head.appendChild(style);

        // 定时轮巡替换图标内容
        setInterval(() => {
            const indicator = document.querySelector('.philosophy-emotion-indicator.emotion-clarity');
            if (indicator && indicator.innerHTML === '☀️') {
                indicator.innerHTML = '✺'; // 换成更具设计感的“日晕”符号
            }
            
            // 顺便把你不喜欢的“平庸”也加入隐藏逻辑
            const editor = document.getElementById('note-in');
            const widget = document.querySelector('.philosophy-emotion-indicator');
            if (editor && widget && editor.value.includes("平庸")) {
                widget.style.opacity = "0.1"; // 探测到“平庸”时，观察者变得极度暗淡
            }
        }, 1000);
    };

    // 注册插件
    if (window.AlterPlugins) {
        AlterPlugins.register(keywordPlugin);
        reshapeUI(); // 载入即执行视觉修补
        AlterAPI.showMsg("意识脉络载入，视觉已重塑");
    }
})();
