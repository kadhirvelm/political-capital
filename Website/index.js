const extractDirection = (element) => element.id.split('-')[0];
const formatIntoDiv = (div) => "#" + div;

function handleChangingDivPositions(elementDirection, firstElement, secondElement){ // left, home, why
    const direction = extractDirection(elementDirection);
    hideFirstElementAndDisplaySecond(direction, formatIntoDiv(firstElement), formatIntoDiv(secondElement));
}

const oppositeMapping = {
    left: "right",
    right: "left",
    top: "bottom",
    bottom: "top",
    "top_left": "bottom_right",
    "top_right": "bottom_left",
    "bottom_left": "top_right",
    "bottom_right": "top_left",
}

function hideFirstElementAndDisplaySecond(direction, firstElement, secondElement){
    document.querySelector(secondElement).classList.remove("hidden");
    document.querySelector(secondElement).classList.add("slide-in-" + direction);
    document.querySelector(firstElement).classList.add("hide-" + oppositeMapping[direction]);
    setTimeout(() => {
        document.querySelector(firstElement).classList.add("hidden");
        document.querySelector(secondElement).classList.remove("slide-in-" + direction);
        document.querySelector(firstElement).classList.remove("hide-" + oppositeMapping[direction]);
    }, 500)
}

function handleHoverRemoveBlinker(element){
    document.querySelector("#" + element.id).classList.remove("blinker");
    fadeAllIndicators(element.id);
}

function fadeOthers(element){
    fadeAllIndicators(element.id);
}

function fadeAllIndicators(exceptElement){
    ([ 'left-arrow-home', 'top-arrow-home', 'right-arrow-home', 'bottom-arrow-home' ].forEach((id) => {
        const query = "#" + id;
        if(id !== exceptElement) {
            document.querySelector(query).classList.add("faded");
            document.querySelector(query).classList.remove("blinker");
        } else {
            document.querySelector(query).classList.remove("faded");
        }
    }))
}