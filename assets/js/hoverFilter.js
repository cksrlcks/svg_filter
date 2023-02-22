import { lineEq, lerp, distance } from "./helper.js";

const getMousePos = (e) => {
    let posx = 0;
    let posy = 0;
    if (!e) e = window.event;
    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return { x: posx, y: posy };
};

const feDisplacementMapEl = document.querySelector("feDisplacementMap");
let winsize;
const calcWinsize = () => (winsize = { width: window.innerWidth, height: window.innerHeight });
calcWinsize();

export default class HoverFilterNav {
    constructor() {
        this.DOM = {
            svg: document.querySelector("svg.distort"),
            list: document.querySelector(".screen__list"),
            imgs: [],
        };

        this.DOM.links = [...this.DOM.list.querySelectorAll("li")];

        this.mousePos = { x: winsize.width / 2, y: winsize.height / 2 };
        this.lastMousePos = {
            translation: { x: winsize.width / 2, y: winsize.height / 2 },
            displacement: { x: 0, y: 0 },
        };
        this.dmScale = 0;

        this.current = -1;

        this.imgSetting();

        this.init();

        requestAnimationFrame(() => this.render());
    }
    imgSetting() {
        const imagesURLs = [];
        this.DOM.links.forEach((item) => {
            imagesURLs.push(item.getAttribute("data-img"));
        });

        imagesURLs.forEach((url) => {
            const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
            image.setAttributeNS(null, "x", "50");
            image.setAttributeNS(null, "y", "50");
            image.setAttributeNS("http://www.w3.org/1999/xlink", "href", url);
            image.setAttributeNS(null, "width", "250");
            image.setAttributeNS(null, "height", "350");
            this.DOM.svg.querySelector("g").appendChild(image);
            this.DOM.imgs.push(image);
        });
    }

    init() {
        window.addEventListener("mousemove", (e) => (this.mousePos = getMousePos(e)));

        this.DOM.links.forEach((item, pos) => {
            const mouseenterFn = () => {
                if (this.current !== -1) {
                    TweenMax.set(this.DOM.imgs[this.current], { opacity: 0 });
                }
                this.current = pos;

                if (this.fade) {
                    TweenMax.to(this.DOM.imgs[this.current], 0.5, { ease: Quad.easeOut, opacity: 1 });
                    this.fade = false;
                } else {
                    TweenMax.set(this.DOM.imgs[this.current], { opacity: 1 });
                }
            };
            item.addEventListener("mouseenter", mouseenterFn);

            const mousemenuenterFn = () => (this.fade = true);
            const mousemenuleaveFn = () => TweenMax.to(this.DOM.imgs[this.current], 0.2, { ease: Quad.easeOut, opacity: 0 });

            this.DOM.list.addEventListener("mouseenter", mousemenuenterFn);
            this.DOM.list.addEventListener("mouseleave", mousemenuleaveFn);
        });
    }

    render() {
        this.lastMousePos.translation.x = lerp(this.lastMousePos.translation.x, this.mousePos.x, 0.1);
        this.lastMousePos.translation.y = lerp(this.lastMousePos.translation.y, this.mousePos.y, 0.1);
        this.DOM.svg.style.transform = `translateX(${this.lastMousePos.translation.x - winsize.width / 2}px) translateY(${this.lastMousePos.translation.y - winsize.height / 2}px)`;

        this.lastMousePos.displacement.x = lerp(this.lastMousePos.displacement.x, this.mousePos.x, 0.1);
        this.lastMousePos.displacement.y = lerp(this.lastMousePos.displacement.y, this.mousePos.y, 0.1);
        const mouseDistance = distance(this.lastMousePos.displacement.x, this.mousePos.x, this.lastMousePos.displacement.y, this.mousePos.y);
        this.dmScale = Math.min(lineEq(50, 0, 140, 0, mouseDistance), 50);
        feDisplacementMapEl.scale.baseVal = this.dmScale;

        requestAnimationFrame(() => this.render());
    }
}
