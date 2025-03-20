import copy
import random


class CFG:

    def __init__(self, starting_variable='S'):
        self.rules = {}  # Key - variable | Value - tuple of ruleset, cost, weight
        self.starting_var = starting_variable

    # Check if the starting variable exists in the ruleset
    def check_if_missing_start(self):
        if self.starting_var not in self.rules:
            raise ValueError(f"Starting variable {self.starting_var} is not in the rule set!")

    # Creates or adds the new rule associated to a variable
    def add_rule(self, variable, ruleset, cost, weight):

        # Add rule if rule doesn't already exist
        if variable not in self.rules:
            self.rules[variable] = ([ruleset], [cost], [weight])

        # If key exist, append it onto the existing rules
        else:
            self.rules[variable][0].append(ruleset)
            self.rules[variable][1].append(cost)
            self.rules[variable][2].append(weight)

    # Generate a string from in this language based on a certain cost value
    def generate(self, cost):
        used_rules = copy.deepcopy(self.rules)
        total_cost = 0

        def replace_variable(exp, index, replacement):
            out = ""

            for i in range(len(exp)):

                if i != index:
                    out += exp[i]
                else:
                    out += replacement

            return out

        def expand(variable):
            current_set = used_rules[variable]

            highest_rules = []
            highest_cost = 0
            selected_i = 0

            # Find the indexes that provide the highest costs
            for i in range(len(current_set[0])):
                i_cost = current_set[1][i]

                # If higher cost if found, reset the highest rules
                if i_cost > current_set[1][highest_cost] and i_cost + total_cost <= cost:
                    highest_rules = [i]
                    highest_cost = i

                # If same cost, add them to the highest rules
                elif i_cost == current_set[1][highest_cost]:
                    highest_rules.append(i)

            # If multiple choices, randomly pick using the weights
            if len(highest_rules) > 1:
                collective_weights = sum(current_set[2][i] for i in highest_rules)

                rand = random.random()
                total_chance = 0

                # Goes to each i value and calculate the chance, selecting the randomly picked i value
                for i in highest_rules:
                    total_chance += current_set[2][i] / collective_weights

                    if rand <= total_chance:
                        selected_i = i
                        break
            else:
                selected_i = 0

            current_cost = used_rules[variable][1][selected_i]
            used_rules[variable][1][selected_i] += self.rules[variable][1][selected_i]

            return current_set[0][selected_i], current_cost

        expression, expression_cost = expand(self.starting_var)
        total_cost += expression_cost

        current_index = 0
        no_variables = True

        while True:

            # Only expand if the current index is on a variable
            if expression[current_index] in used_rules:
                no_variables = False

                # Expand current index
                expanded_expression, expanded_expression_cost = expand(expression[current_index])
                total_cost += expanded_expression_cost

                # Add to statement
                target_index = current_index

                if current_index < 0:
                    target_index = len(expression) + current_index

                expression = replace_variable(expression, target_index, expanded_expression)

            # set current index to the opposite #
            mid = len(expression) // 2
            neg_mid = mid - len(expression)

            print(current_index, mid, neg_mid, expression)

            if current_index > 20:
                break

            if current_index == mid or current_index == neg_mid:

                if no_variables:
                    break

                no_variables = True
                current_index = 0
            elif current_index >= 0:
                current_index = (current_index + 1) * -1
            else:
                current_index *= -1

        return expression
