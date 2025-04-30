import animate from '../engine/engineer.js';

document.addEventListener('DOMContentLoaded', () => {
    const cont = document.querySelectorAll('.tab-content');
    const engineDebug = document.getElementById('debug');
    const tabs = document.querySelectorAll('.tab');
    const renderElement = renderer.domElement;
    const buttons = document.querySelectorAll('.mode-button');

    // Tab switching logic
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active')); // Remove active tab
            cont.forEach(c => c.classList.remove('active')); // Remove active content
            tab.classList.add('active'); // Add active tab
            document.getElementById(tab.dataset.tab).classList.add('active'); // Add content

            if (tab.dataset.tab === 'tab2' && webToggle) {
                engineDebug.style.display = renderElement.style.display = 'block';
                webToggle = !webToggle;
                tickID = requestAnimationFrame(animate);
            }else if (tab.dataset.tab !== 'tab2' && !webToggle) {
                engineDebug.style.display = renderElement.style.display = 'none';
                webToggle = !webToggle;
                cancelAnimationFrame(tickID);
                tickID = null;
            }
        });
    });

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active')); // Remove active state from all buttons
            button.classList.add('active'); // Add active state to the clicked button

            switch (button.id) {
                case 'play-button':
                    mode = 'play';
                    break;
                case 'land-button':
                    mode = 'land';
                    break;
                case 'room-button':
                    mode = 'room';
                    break;
            }
        });
    });
});