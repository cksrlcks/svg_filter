export const lineEq = (y2, y1, x2, x1, currentVal) => {
    var m = (y2 - y1) / (x2 - x1),
        b = y1 - m * x1;
    return m * currentVal + b;
};

export const lerp = (a, b, n) => (1 - n) * a + n * b;

export const distance = (x1, x2, y1, y2) => {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.hypot(a, b);
};

export const closestEdge = (x, y, w, h) => {
    const topEdgeDist = distMetric(x, y, w / 2, 0);
    const bottomEdgeDist = distMetric(x, y, w / 2, h);
    const min = Math.min(topEdgeDist, bottomEdgeDist);
    return min === topEdgeDist ? "top" : "bottom";
};

export const distMetric = (x, y, x2, y2) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
};
