export default class NormalizedLinearEquation {

    private x_min: number;
    private x_max: number;
    private y_min: number;
    private y_max: number;
    private a: number;

    constructor(x_min: number = 0, x_max: number, y_min: number = 0, y_max: number = 0) {
        this.x_min = x_min;
        this.x_max = x_max;
        this.y_min = y_min;
        this.y_max = y_max;
        this.a = this.calculateA();
    }

    private calculateA(): number {
        return (this.y_max - this.y_min);
    }

    private normalizeX(x: number): number {
        return (x - this.x_min) / (this.x_max - this.x_min);
    }

    public calc(x: number): number {

        // Normalize x
        let normalized_x = this.normalizeX(x);

        // Calculate
        return (this.a * normalized_x) + this.y_min;
    }




}