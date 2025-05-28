INSERT INTO public.rating_classes (id, name) VALUES (1, 'Erwachsene');
INSERT INTO public.rating_classes (id, name) VALUES (2, 'Kinder');

INSERT INTO public.players (id, created_at, firstname, lastname, rating_class_id) VALUES (1, '2025-05-20 11:04:12.798362+00', 'Donald', 'Duck', 1);
INSERT INTO public.players (id, created_at, firstname, lastname, rating_class_id) VALUES (2, '2025-05-20 11:04:24.806827+00', 'Evil', 'Knevil', 1);
INSERT INTO public.players (id, created_at, firstname, lastname, rating_class_id) VALUES (3, '2025-05-20 11:04:34.088117+00', 'Mickey', 'Mouse', 2);

INSERT INTO public.tournaments (id, created_at, name, start_date, end_date, number_of_holes, minimum_participants, description) VALUES (1, '2025-05-20 11:08:22.998996+00', 'Test Turnier', '2025-05-06 08:00:00+00', '2025-05-06 15:00:00+00', 18, 2, '* Kein Strafschlag, wenn der Ball die Bahn verlässt
* Nach `6` Schlägen wird eine `7` notiert.');

INSERT INTO public.sessions (id, created_at, submitted_at, tournament_id, user_id) VALUES (1, '2025-05-20 11:13:25.287791+00', NULL, 1, 'dabb3c14-40a1-4088-98bf-44d2dbd29b3e');
INSERT INTO public.sessions (id, created_at, submitted_at, tournament_id, user_id) VALUES (2, '2025-05-20 11:14:25.287791+00', NULL, 1, 'dabb3c14-40a1-4088-98bf-44d2dbd29b3A');
INSERT INTO public.sessions (id, created_at, submitted_at, tournament_id, user_id) VALUES (3, '2025-05-20 12:13:25.287791+00', NULL, 1, 'dabb3c14-40a1-4088-98bf-44d2dbd29b3e');

INSERT INTO public.rating_classes_to_tournaments (rating_class_id, tournament_id) VALUES (1, 1);
INSERT INTO public.rating_classes_to_tournaments (rating_class_id, tournament_id) VALUES (2, 1);

INSERT INTO public.scorecards (id, session_id, player_id, data) VALUES (1, 1, 1, '[1,2,3,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0]');
INSERT INTO public.scorecards (id, session_id, player_id, data) VALUES (2, 1, 3, '[1,2,3,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0]');
INSERT INTO public.scorecards (id, session_id, player_id, data) VALUES (3, 2, 3, '[1,2,3,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0]');
INSERT INTO public.scorecards (id, session_id, player_id, data) VALUES (4, 3, 2, '[1,2,3,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0]');
INSERT INTO public.scorecards (id, session_id, player_id, data) VALUES (5, 3, 3, '[1,2,3,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0]');
