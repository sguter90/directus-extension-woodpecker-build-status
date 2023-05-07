import {defineHook} from '@directus/extensions-sdk';

export default defineHook(({embed}, {env}) => {
    embed(
        'body',
        () => {
			return `
<div class="loader-wrapper">
    <div id="woodpecker-build-status" class="loader-line"></div>
</div>
<style>
.loader-wrapper {
    height: 5px;
    width: 100%;
    position: absolute;
    top: 0;
    overflow: hidden;
    z-index: 100;
}
.loader-line {
    height: 5px;
    width: 100%;
    background-color: #ddd;
    border-radius: 20px;
    z-index: 100;
}

.loader-line:before {
    content: "";
    position: absolute;
    left: -50%;
    height: 5px;
    width: 40%;
    border-radius: 20px;
    background-color: #ddd;
}

.loader-line.in-progress {
    animation: lineAnim 2s linear infinite;
    background-color: var(--primary);
}

.loader-line.success {
    background-color: var(--primary);
    animation: fadeOut 3s linear forwards;
}

.loader-line.failed {
    background-color: var(--danger);
    animation: lineAnim 2s linear infinite;
}

@keyframes lineAnim {
    0% {
        left: 0;
        width: 10%;
    }
    50% {
        left: 20%;
        width: 60%;
    }
    100% {
        left: 100%;
        width: 100%;
    }
}
@keyframes fadeOut {
    0% { opacity: 1;}
    99% { opacity: 0.01;}
    100% { opacity: 0;}
}

@keyframes blink {
    0% { opacity: 1;}
    50% { opacity: 0.35;}
    100% { opacity: 0.7;}
}
</style>
<script>
parseStatus = function(buildData) {
    if (buildData.getNamedItem('activity').value === "Building") {
        return 'in-progress';
    }
    
    let lastBuildStatus = buildData.getNamedItem('lastBuildStatus').value;
    if (lastBuildStatus === 'Success') {
        return 'success';
    }
    
    return 'failed';
}
fetchBuild = async function() {
    const response = await fetch('${env.WOODPECKER_BUILD_STATUS_URL}');
    const data = await response.text();
    const dataParsed = (new DOMParser()).parseFromString(data, 'text/xml');
    
    return dataParsed.querySelector('Projects Project').attributes;
}
showStatus = async function(elem) {
    const buildData = await fetchBuild();
    const buildStatus = parseStatus(buildData);
    
    elem.classList.add(buildStatus);
    if(buildStatus === 'in-progress') {
        elem.classList.remove('success');
        elem.classList.remove('failed');
    } else if(buildStatus === 'success') {
        elem.classList.remove('failed');
        elem.classList.remove('in-progress');
    } else if (buildStatus === 'failed') {
        elem.classList.remove('success');
        elem.classList.remove('in-progress');
    }
}
const loadingLine = document.getElementById('woodpecker-build-status');
setInterval(() => {
    showStatus(loadingLine);
}, 2000)
</script>
`
		}
    );
});
