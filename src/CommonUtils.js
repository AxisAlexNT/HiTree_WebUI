export default class CommonUtils {
    static clamp(x, min, max) {
        return Math.min(Math.max(x, min), max);
    }
}