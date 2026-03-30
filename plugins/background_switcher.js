/**
 * 插件名称：视觉背景切换 (Visual Background Switcher)
 * 修正内容：改写 CSS 变量 --bg 以穿透 UI 层级，并处理图片透明度冲突。
 * 存储位置：/plugins/background_switcher.js
 */
(function() {
    const bgSwitcher = {
        name: "视觉背景切换",
        author: "Alter OpenSource",
        run: function() {
            const choice = prompt("更换背景：\n1. 输入颜色代码 (如 #e3e3e3)\n2. 输入图片链接 (http...)\n3. 输入 reset 还原");
            
            if (choice === null) return;

            const root = document.documentElement;
            const target = document.body;
            const val = choice.trim().toLowerCase();

            if (val === 'reset') {
                // 还原逻辑
                root.style.removeProperty('--bg');
                target.style.backgroundImage = '';
                AlterAPI.showMsg("已恢复原始视野");
            } else if (val.startsWith('http')) {
                // 图片链接逻辑
                // 1. 设置背景图
                target.style.backgroundImage = "url('" + choice + "')";
                target.style.backgroundSize = "cover";
                target.style.backgroundPosition = "center";
                target.style.backgroundAttachment = "fixed";
                
                // 2. 关键：将 UI 背景设为半透明，否则图片会被遮挡
                root.style.setProperty('--bg', 'rgba(255, 255, 255, 0.7)'); 
                AlterAPI.showMsg("壁纸意境已同步");
            } else {
                // 纯色代码逻辑
                // 直接修改全局背景变量，这样 main 区域会跟着变
                root.style.setProperty('--bg', choice);
                target.style.backgroundImage = 'none';
                AlterAPI.showMsg("环境色彩已重构");
            }
        }
    };

    if (window.AlterPlugins) {
        AlterPlugins.register(bgSwitcher);
    }
})();
