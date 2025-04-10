from cfg import CFG

# Linear Equation

cfg = CFG()

cfg.add_rule('S', 'E=E', 0, 1, 1)
cfg.add_rule('E', 'T', 0, 0.5, 1)
cfg.add_rule('E', 'E+T', 2, 0.5, 1)
cfg.add_rule('E', 'E-T', 2, 0.5, 1)
cfg.add_rule('E', 'E(T)', 10, 0.5, 1)
cfg.add_rule('E', 'T(E)', 10, 0.5, 1)
cfg.add_rule('E', '\\\\frac{T}{E}', 20, 0.5, 1)
cfg.add_rule('E', '\\\\frac{E}{T}', 20, 0.5, 1)
cfg.add_rule('T', 'C', 0, 0.5, 2)
cfg.add_rule('T', 'x', 1, 0.5, 2)
cfg.add_rule('T', 'Cx', 2, 0.5, 2)
cfg.add_rule('C', 'c', 0, 0.5, 2)
cfg.add_rule('C', '\\\\frac{c}{c}', 8, 0.5, 2)
cfg.add_rule('C', 'd', 8, 0.5, 2)

print(cfg.generate(105))

# System of Equations

