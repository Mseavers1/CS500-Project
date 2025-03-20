from cfg import CFG

cfg = CFG()

cfg.add_rule('S', 'E=E', 0, 1)
cfg.add_rule('E', 'E+T', 1, 0.5)
cfg.add_rule('E', 'E-T', 1, 0.5)
cfg.add_rule('E', 'E(E)', 5, 0.5)
cfg.add_rule('E', 'E/E', 10, 0.5)
cfg.add_rule('T', 'a', 0, 0.5)
cfg.add_rule('T', 'x', 1, 0.5)
cfg.add_rule('T', 'ax', 1, 0.5)

print(cfg.generate(4))
