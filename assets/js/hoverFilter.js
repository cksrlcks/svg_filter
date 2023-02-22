import { lineEq, lerp, distance } from "./helper.js";

export default class HoverFilterNav {
    constructor() {
        this.DOM = {
            svg: document.querySelector("svg.distort"),
            list: document.querySelector(".screen__list"),
            imgs: [],
            feDisplacementMapEl: document.querySelector("feDisplacementMap"),
        };
        this.winsize;
        this.DOM.links = [...this.DOM.list.querySelectorAll("li")];
        this.dmScale = 0;
        this.current = -1;

        this.imgSetting();
        this.init();
        requestAnimationFrame(() => this.render());
    }
    calcWinsize() {
        this.winsize = { width: window.innerWidth, height: window.innerHeight };
    }

    getMousePos(e) {
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
    }

    imgSetting() {
        const imagesURLs = [];
        this.DOM.links.forEach((item) => {
            imagesURLs.push(item.getAttribute("data-img"));
        });
        const lenght = imagesURLs.length;
        imagesURLs.forEach((url, idx) => {
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
        this.calcWinsize();
        window.addEventListener("resize", this.calcWinsize);

        this.mousePos = { x: this.winsize.width / 2, y: this.winsize.height / 2 };
        this.lastMousePos = {
            translation: { x: this.winsize.width / 2, y: this.winsize.height / 2 },
            displacement: { x: 0, y: 0 },
        };

        window.addEventListener("mousemove", (e) => (this.mousePos = this.getMousePos(e)));

        this.DOM.links.forEach((item, pos) => {
            item.addEventListener("mouseenter", () => {
                console.log(pos + "in");
                this.DOM.imgs.forEach((item, idx) => {
                    if (idx != pos) {
                        item.classList.remove("on");
                    } else {
                        item.classList.add("on");
                    }
                });
            });

            const mousemenuenterFn = () => {
                TweenMax.to(this.DOM.svg, 0.5, { ease: Quad.easeOut, opacity: 1 });
            };
            const mousemenuleaveFn = () => {
                TweenMax.to(this.DOM.svg, 0.5, { ease: Quad.easeOut, opacity: 0 });
            };

            this.DOM.list.addEventListener("mouseenter", mousemenuenterFn);
            this.DOM.list.addEventListener("mouseleave", mousemenuleaveFn);
        });
    }

    render() {
        this.lastMousePos.translation.x = lerp(this.lastMousePos.translation.x, this.mousePos.x, 0.1);
        this.lastMousePos.translation.y = lerp(this.lastMousePos.translation.y, this.mousePos.y, 0.1);
        this.DOM.svg.style.transform = `translateX(${this.lastMousePos.translation.x - this.winsize.width / 2}px) translateY(${
            this.lastMousePos.translation.y - this.winsize.height / 2
        }px)`;

        this.lastMousePos.displacement.x = lerp(this.lastMousePos.displacement.x, this.mousePos.x, 0.1);
        this.lastMousePos.displacement.y = lerp(this.lastMousePos.displacement.y, this.mousePos.y, 0.1);
        const mouseDistance = distance(this.lastMousePos.displacement.x, this.mousePos.x, this.lastMousePos.displacement.y, this.mousePos.y);
        this.dmScale = Math.min(lineEq(50, 0, 140, 0, mouseDistance), 50);
        this.DOM.feDisplacementMapEl.scale.baseVal = this.dmScale;

        requestAnimationFrame(() => this.render());
    }
}
