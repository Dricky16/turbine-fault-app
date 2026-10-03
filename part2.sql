-- Deduplication Script generated automatically

-- Merging "Dior Sauvage" into "Sauvage"
UPDATE dupes SET original_id = 'f2b9b9a7-9b2c-4b5b-8b5b-9b5b9b5b9b5b' WHERE original_id = 'e08d35c6-339a-4624-b8dd-19725e75377e';
UPDATE favorites SET perfume_id = 'f2b9b9a7-9b2c-4b5b-8b5b-9b5b9b5b9b5b' WHERE perfume_id = 'e08d35c6-339a-4624-b8dd-19725e75377e';
DELETE FROM perfumes WHERE id = 'e08d35c6-339a-4624-b8dd-19725e75377e';

-- Merging "Sauvage Elixir" into "Sauvage"
UPDATE dupes SET original_id = 'f2b9b9a7-9b2c-4b5b-8b5b-9b5b9b5b9b5b' WHERE original_id = '4009c968-22e1-4928-a9a9-3585e460373e';
UPDATE favorites SET perfume_id = 'f2b9b9a7-9b2c-4b5b-8b5b-9b5b9b5b9b5b' WHERE perfume_id = '4009c968-22e1-4928-a9a9-3585e460373e';
DELETE FROM perfumes WHERE id = '4009c968-22e1-4928-a9a9-3585e460373e';

-- Merging "Jo Malone Pomegranate Noir" into "Pomegranate Noir"
UPDATE dupes SET original_id = '965ea342-8e8a-476f-87da-27526f80d7da' WHERE original_id = '30a325aa-b6c6-4c50-9348-e8c486db4fa2';
UPDATE favorites SET perfume_id = '965ea342-8e8a-476f-87da-27526f80d7da' WHERE perfume_id = '30a325aa-b6c6-4c50-9348-e8c486db4fa2';
DELETE FROM perfumes WHERE id = '30a325aa-b6c6-4c50-9348-e8c486db4fa2';

-- Merging "Paco Rabanne 1 Million" into "1 Million"
UPDATE dupes SET original_id = 'caea8ea3-8e64-4654-8345-4c867d718cd0' WHERE original_id = '526d60e3-3592-4737-a69d-9757249869d0';
UPDATE favorites SET perfume_id = 'caea8ea3-8e64-4654-8345-4c867d718cd0' WHERE perfume_id = '526d60e3-3592-4737-a69d-9757249869d0';
DELETE FROM perfumes WHERE id = '526d60e3-3592-4737-a69d-9757249869d0';

-- Merging "Initio Oud for Greatness" into "Oud for Greatness"
UPDATE dupes SET original_id = '666918d8-f9b3-4b41-ad98-c92f7bd4302e' WHERE original_id = '248d561f-56af-49ca-996c-ec86106af5e3';
UPDATE favorites SET perfume_id = '666918d8-f9b3-4b41-ad98-c92f7bd4302e' WHERE perfume_id = '248d561f-56af-49ca-996c-ec86106af5e3';
DELETE FROM perfumes WHERE id = '248d561f-56af-49ca-996c-ec86106af5e3';

-- Merging "Miss Dior Blooming Bouquet" into "Miss Dior"
UPDATE dupes SET original_id = '4037498e-ad21-46b5-a9f3-f0c8e692f4b0' WHERE original_id = 'f1f41d3b-6e94-4d8e-908c-6e828d8cb5aa';
UPDATE favorites SET perfume_id = '4037498e-ad21-46b5-a9f3-f0c8e692f4b0' WHERE perfume_id = 'f1f41d3b-6e94-4d8e-908c-6e828d8cb5aa';
DELETE FROM perfumes WHERE id = 'f1f41d3b-6e94-4d8e-908c-6e828d8cb5aa';

-- Merging "Mugler Alien" into "Alien"
UPDATE dupes SET original_id = '8c3850b5-1cfd-4632-bfec-77dc2af093b8' WHERE original_id = '8eb3e7ec-5848-4fa5-b0bd-9328aacd7e2a';
UPDATE favorites SET perfume_id = '8c3850b5-1cfd-4632-bfec-77dc2af093b8' WHERE perfume_id = '8eb3e7ec-5848-4fa5-b0bd-9328aacd7e2a';
DELETE FROM perfumes WHERE id = '8eb3e7ec-5848-4fa5-b0bd-9328aacd7e2a';
