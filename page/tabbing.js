import animate from '../engine/engineer.js';

document.addEventListener('DOMContentLoaded', function() {
    const cont = document.querySelectorAll('.tab-content');
    const engineDebug = document.getElementById('debug');
    const tabs = document.querySelectorAll('.tab');
    const renderElement = renderer.domElement;

    tabs.forEach(tab => { tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active')); // Remove active tab
            cont.forEach(c => c.classList.remove('active')); // Remove active content
            tab.classList.add('active'); // Add active tab
            document.getElementById(tab.dataset.tab).classList.add('active'); // Add content

            if (tab.dataset.tab !== 'tab2' && !webToggle) {
                engineDebug.style.display = renderElement.style.display = 'none';
                webToggle = !webToggle;
                endAnimation();
            } else if (tab.dataset.tab === 'tab2' && webToggle) {
                engineDebug.style.display = renderElement.style.display = 'block';
                webToggle = !webToggle;
                bgnAnimation();
            }
        });
    });

    function bgnAnimation() { if(!tickID) { tickID = requestAnimationFrame(animate) }} // Starts animation
    function endAnimation() { if(tickID) { cancelAnimationFrame(tickID); tickID = null }} // End animation
});