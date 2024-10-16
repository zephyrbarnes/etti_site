import animate from '../engine/engineer.js';

document.addEventListener('DOMContentLoaded', function() {
    const exitButton = document.getElementById('exit-button');
    const cont = document.querySelectorAll('.tab-content');
    const engineDebug = document.getElementById('debug');
    const tabView = document.getElementById('tab-view');
    const tabs = document.querySelectorAll('.tab');
    const renderElement = renderer.domElement;

    tabs.forEach(tab => { tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active')); // Remove active tab
            cont.forEach(c => c.classList.remove('active')); // Remove active content
            tab.classList.add('active'); // Add active tab
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    exitButton.addEventListener('click', function() {
        webToggle = !webToggle;
        tabView.style.display = 'none';
        engineDebug.style.display = renderElement.style.display = 'block';
        bgnAnimation();
    });

    function bgnAnimation() { if(!tickID) { tickID = requestAnimationFrame(animate)}}
    function endAnimation() { if(tickID) { cancelAnimationFrame(tickID); tickID = null}}

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !webToggle) {
            webToggle = !webToggle;
            tabView.style.display = 'block';
            engineDebug.style.display = renderElement.style.display = 'none';
            endAnimation();
        }else if (event.key === 'Escape' && webToggle) {
            webToggle = !webToggle;
            tabView.style.display = 'none';
            engineDebug.style.display = renderElement.style.display = 'block';
            bgnAnimation();
        }
    });
});