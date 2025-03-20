class cfgGenerator {

    grammar = new Map<string, string[]>
    complexity = new Map<string, number>()

    constructor() {
        this.grammar = new Map<string, string[]>();
        this.complexity = new Map<string, number>();
    }

    add(variable: string, grammars: string[], complexity: number) {
        this.grammar.set(variable, grammars);
        this.complexity.set(variable, complexity);
    }

    generate(weights: Map<string, number[]>): string {

        // Assume the S variable is the starting variable
        let starting = this.getGrammarOfVariable("S", weights);
        let result = "";
        let stack: string[] = this.tokenize(starting).reverse();

        while (stack.length > 0) {

            let value = stack.pop() as string;

            // Check to see if value is a variable
            if (/^[A-Z]$/.test(value)) {
                let v = this.tokenize(this.getGrammarOfVariable(value, weights))

                // Add to stack
                for (let i = v.length - 1; i >= 0; i--) {
                    stack.push(v[i]);
                }
            }
            // Check if it is a number or x
            else if (/^[a-z]$/.test(value)) {

                if (value === 'x') result += "x";
                else {
                    // Generate a random number (fraction or decimal or large or small, or negative)
                    let rand = Math.floor(Math.random() * 100);

                    result += rand;
                }
            }
            else {
                result += value;
            }
        }


        return result;
    }

    getGrammarOfVariable(variable: string, weights: Map<string, number[]>): string {
        let items = this.grammar.get(variable) as string[];

        let r = Math.random();
        let w = weights.get(variable) as number[];

        for (let i = items.length - 1; i >= 0; i--) {
            if (r <= w[i]) {
                return items[i];
            }
        }

        return items[0];
    }

    tokenize(expression: string): string[] {
        return expression.match(/(\d+|[a-zA-Z]+|[\(\)=\+\-\*/])/g) || [];
    }


}

export default cfgGenerator;