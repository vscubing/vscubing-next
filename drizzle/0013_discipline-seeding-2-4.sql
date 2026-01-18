-- Custom SQL migration file, put your code below! --
INSERT INTO discipline (slug)
VALUES
  ('2by2'),
  ('3by3'),
  ('4by4')
ON CONFLICT DO NOTHING;
