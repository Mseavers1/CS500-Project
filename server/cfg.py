import copy
import random
import re


class CFG:

    def __init__(self, starting_variable='S'):
        self.rules = {}  # Key - variable | Value - tuple of ruleset, cost, weight
        self.starting_var = starting_variable

    def check_if_missing_start(self):

        """Check if the starting variable exists in the ruleset"""

        if self.starting_var not in self.rules:
            raise ValueError(f"Starting variable {self.starting_var} is not in the rule set!")

    def add_rule(self, variable, ruleset, cost, weight, priority):

        """Creates or adds the new rule associated to a variable"""

        # Add rule if rule doesn't already exist
        if variable not in self.rules:
            self.rules[variable] = ([ruleset], [cost], [weight], [priority])

        # If key exist, append it onto the existing rules
        else:
            self.rules[variable][0].append(ruleset)
            self.rules[variable][1].append(cost)
            self.rules[variable][2].append(weight)
            self.rules[variable][3].append(priority)

    def generate(self, capped_cost):
        """Generate a string from in this language based on a certain cost value"""

        used_rules = copy.deepcopy(self.rules)
        total_cost = 0

        def replace_variable(exp, index, replacement):
            """Replaced a index in a string with a replacement string"""

            # if index is neg, have it be the positive version
            if index < 0:
                index = len(exp) + index

            out = ""

            for i in range(len(exp)):

                if i != index:
                    out += exp[i]
                else:
                    out += replacement

            return out

        def expand(variable):
            """Expands the current variable into one of its available options"""

            options = used_rules[variable]
            highest_costs = []
            selected_i = None

            # Selects the i values that have the highest cost but are within the capped
            for i in range(len(options[0])):

                i_cost = options[1][i]

                # If option is the same cost as the highest, add it to the available options
                if len(highest_costs) > 0 and i_cost == options[1][highest_costs[0]]:
                    highest_costs.append(i)

                # If the option is higher, reset options and select highest
                elif len(highest_costs) == 0 or (i_cost > options[1][highest_costs[0]] and i_cost + total_cost <= capped_cost):
                    highest_costs = [i]

            # If multiple i values, select only one based on the weight values
            if len(highest_costs) > 1:

                rand_num = random.random()
                collective_weights = sum(options[2][i] for i in highest_costs)
                total_weights = 0

                # Iterates through each cost and chances to see if i is selected
                for i in highest_costs:
                    total_weights += options[2][i] / collective_weights

                    if rand_num <= total_weights:
                        selected_i = i
                        break
            else:
                selected_i = highest_costs[0]

            # Return langauge of the selected i and the cost
            cost = options[1][selected_i]
            used_rules[variable][1][selected_i] += self.rules[variable][1][selected_i]

            return options[0][selected_i], cost

        # Start with the starting variable and then keep expanding until finished
        expression, starting_cost = expand(self.starting_var)
        total_cost += starting_cost
        starting_i = 0

        step = 0
        while True:

            end_i = len(expression) if starting_i == 0 else -len(expression) - 1
            increment = 1 if starting_i == 0 else -1
            priority_location = starting_i
            highest_priority = 0
            only_terminals = True

            # Retrieve the highest priority variable in expression
            for i in range(starting_i, end_i, increment):

                # Only save the first occurrence of the highest priority
                if expression[i] in used_rules and used_rules[expression[i]][3][0] > highest_priority:
                    priority_location = i
                    highest_priority = used_rules[expression[i]][3][0]

            # Only Expand if the priority is not a terminal
            if expression[priority_location] in used_rules:

                only_terminals = False

                # Expand the highest priority
                expanded, expanded_cost = expand(expression[priority_location])

                # Add total cost
                total_cost += expanded_cost

                # Replace the old variable with the expanded expression in the final expression
                expression = replace_variable(expression, priority_location, expanded)

            if only_terminals:
                break

            # Flip starting side only if priority is a 1
            if highest_priority == 1:
                if starting_i == 0:
                    starting_i = -1
                else:
                    starting_i = 0

            print(f"Step {step}: {expression}   -- Total cost: {total_cost}")
            step += 1

        # Replace terminals with values if applicable -- Made with GPT -> Remake?
        def replace_c(expression):
            # Regular expression to match LaTeX math commands like \frac{c}{c} or other math syntax
            latex_pattern = r'\\frac'

            # Find all LaTeX expressions and exclude them from replacement
            latex_matches = re.findall(latex_pattern, expression)

            # Temporarily replace LaTeX expressions with placeholders
            for idx, match in enumerate(latex_matches):
                expression = expression.replace(match, f'DIV{idx}__')

            # Replace all 'c' with a random number, but now it's safe outside LaTeX expressions
            expression = re.sub(r'c', lambda _: str(random.randint(1, 20)), expression)

            # Restore the LaTeX expressions from placeholders
            for idx, match in enumerate(latex_matches):
                expression = expression.replace(f'DIV{idx}__', match)

            return expression

        expression = replace_c(expression)

        return expression
