import { closestEdge } from "./helper.js";

const paths = {
    step1: {
        unfilled: "M 0 100 V 100 Q 50 100 100 100 V 100 z",
        inBetween: {
            curve1: "M 0 100 V 50 Q 50 0 100 50 V 100 z",
            curve2: "M 0 100 V 50 Q 50 100 100 50 V 100 z",
        },
        filled: "M 0 100 V 0 Q 50 0 100 0 V 100 z",
    },
    step2: {
        filled: "M 0 0 V 100 Q 50 100 100 100 V 0 z",
        inBetween: {
            curve1: "M 0 0 V 50 Q 50 0 100 50 V 0 z",
            curve2: "M 0 0 V 50 Q 50 100 100 50 V 0 z",
        },
        unfilled: "M 0 0 V 0 Q 50 0 100 0 V 0 z",
    },
};

export default class MarqueeNav {
    constructor() {
        this.app = document.querySelector(".app");
        this.overlayPath = document.querySelector(".overlay__path");
        this.menuBtn = document.querySelector(".header__menu");
        this.menu = document.querySelector(".menu");
        this.isAnimating = false;
        this.isOpen = false;

        this.menuBtn.addEventListener("click", () => {
            if (this.isAnimating) return;
            this.isOpen ? this.unreveal() : this.reveal();
        });

        new Menu(document.querySelector(".menu"));
    }

    reveal() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.isOpen = true;

        gsap.timeline({
            onComplete: () => (this.isAnimating = false),
        })
            .set(this.overlayPath, {
                attr: { d: paths.step1.unfilled },
            })
            .to(this.overlayPath, {
                duration: 0.8,
                ease: "power4.in",
                attr: { d: paths.step1.inBetween.curve1 },
            })
            .to(this.overlayPath, {
                duration: 0.2,
                ease: "power1",
                attr: { d: paths.step1.filled },
                onComplete: () => this.toggleMenu(),
            })

            .set(this.overlayPath, {
                attr: { d: paths.step2.filled },
            })

            .to(this.overlayPath, {
                duration: 0.2,
                ease: "sine.in",
                attr: { d: paths.step2.inBetween.curve1 },
            })
            .to(this.overlayPath, {
                duration: 1,
                ease: "power4",
                attr: { d: paths.step2.unfilled },
            });
    }

    unreveal() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.isOpen = false;

        gsap.timeline({
            onComplete: () => (this.isAnimating = false),
        })
            .set(this.overlayPath, {
                attr: { d: paths.step2.unfilled },
            })
            .to(
                this.overlayPath,
                {
                    duration: 0.8,
                    ease: "power4.in",
                    attr: { d: paths.step2.inBetween.curve2 },
                },
                0
            )
            .to(this.overlayPath, {
                duration: 0.2,
                ease: "power1",
                attr: { d: paths.step2.filled },
                onComplete: () => this.toggleMenu(),
            })
            // now reveal
            .set(this.overlayPath, {
                attr: { d: paths.step1.filled },
            })
            .to(this.overlayPath, {
                duration: 0.2,
                ease: "sine.in",
                attr: { d: paths.step1.inBetween.curve2 },
            })
            .to(this.overlayPath, {
                duration: 1,
                ease: "power4",
                attr: { d: paths.step1.unfilled },
            });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.menuBtn.querySelector("span").innerHTML = "Close";
            this.app.classList.add("menu--open");
        } else {
            this.menuBtn.querySelector("span").innerHTML = "Menu";
            this.app.classList.remove("menu--open");
        }
    }
}

class Menu {
    constructor(el) {
        this.DOM = { el: el };
        this.DOM.menuItems = this.DOM.el.querySelectorAll(".menu__item");
        this.menuItems = [];
        this.DOM.menuItems.forEach((menuItem) => this.menuItems.push(new MenuItem(menuItem)));
    }
}

class MenuItem {
    constructor(el) {
        this.DOM = { el: el };
        this.DOM.link = this.DOM.el.querySelector(".menu__item-link");
        this.DOM.marquee = this.DOM.el.querySelector(".marquee");
        this.DOM.marqueeInner = this.DOM.marquee.querySelector(".marquee__inner-wrap");
        this.animationDefaults = { duration: 0.6, ease: "expo" };
        this.initEvents();
    }

    initEvents() {
        this.onMouseEnterFn = (e) => this.mouseEnter(e);
        this.DOM.link.addEventListener("mouseenter", this.onMouseEnterFn);
        this.onMouseLeaveFn = (e) => this.mouseLeave(e);
        this.DOM.link.addEventListener("mouseleave", this.onMouseLeaveFn);
    }

    mouseEnter(e) {
        const edge = this.findClosestEdge(e);

        gsap.timeline({ defaults: this.animationDefaults })
            .set(this.DOM.marquee, { y: edge === "top" ? "-101%" : "101%" }, 0)
            .set(this.DOM.marqueeInner, { y: edge === "top" ? "101%" : "-101%" }, 0)
            .to([this.DOM.marquee, this.DOM.marqueeInner], { y: "0%" }, 0);
    }
    mouseLeave(e) {
        const edge = this.findClosestEdge(e);

        gsap.timeline({ defaults: this.animationDefaults })
            .to(this.DOM.marquee, { y: edge === "top" ? "-101%" : "101%" }, 0)
            .to(this.DOM.marqueeInner, { y: edge === "top" ? "101%" : "-101%" }, 0);
    }

    findClosestEdge(e) {
        const x = e.pageX - this.DOM.el.offsetLeft;
        const y = e.pageY - this.DOM.el.offsetTop;
        return closestEdge(x, y, this.DOM.el.clientWidth, this.DOM.el.clientHeight);
    }
}
