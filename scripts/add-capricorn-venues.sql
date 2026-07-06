-- SQL script to add Capricorn District venues
-- This script replaces Cape Town venues with proper Capricorn District venues

-- Insert Capricorn District venues
INSERT INTO venues (id, name, type, max_population, owner_name, owner_contact, address, features, image, created_at, municipality) VALUES
('polokwane-sports-complex', 'Polokwane Sports Complex', 'outdoor', 15000, 'Polokwane Municipality', 'sports@polokwane.gov.za', 'Landdros Mare, Polokwane', '{"Stadium", "Parking", "Changing Rooms", "Catering Facilities"}', '/images/venues/polokwane-sports-complex.jpg', NOW(), 'polokwane'),

('blouberg-community-hall', 'Blouberg Community Hall', 'indoor', 500, 'Blouberg Municipality', 'community@blouberg.gov.za', 'Senwabarana, Blouberg', '{"Stage", "Sound System", "Kitchen Facilities", "Parking"}', '/images/venues/blouberg-community-hall.jpg', NOW(), 'blouberg'),

('molemole-cultural-center', 'Molemole Cultural Center', 'indoor', 800, 'Molemole Municipality', 'culture@molemole.gov.za', 'Mokopane, Molemole', '{"Exhibition Hall", "Theater", "Art Gallery", "Workshop Spaces"}', '/images/venues/molemole-cultural-center.jpg', NOW(), 'molemole'),

('lepel-nkumpi-stadium', 'Lepelle-Nkumpi Stadium', 'outdoor', 8000, 'Lepelle-Nkumpi Municipality', 'stadium@lepel.gov.za', 'Lebowakgomo, Lepelle-Nkumpi', '{"Sports Field", "Running Track", "Changing Rooms", "First Aid"}', '/images/venues/lepel-nkumpi-stadium.jpg', NOW(), 'lepel'),

('polokwane-botanical-gardens', 'Polokwane Botanical Gardens', 'outdoor', 2000, 'Polokwane Municipality', 'gardens@polokwane.gov.za', 'Burgersfort Park, Polokwane', '{"Garden Areas", "Event Spaces", "Educational Facilities", "Parking"}', '/images/venues/polokwane-botanical-gardens.jpg', NOW(), 'polokwane'),

('blouberg-game-reserve', 'Blouberg Game Reserve', 'outdoor', 3000, 'Blouberg Municipality', 'parks@blouberg.gov.za', 'Vivo, Blouberg', '{"Game Viewing Areas", "Camping Sites", "Picnic Areas", "Walking Trails"}', '/images/venues/blouberg-game-reserve.jpg', NOW(), 'blouberg'),

('molemole-mining-museum', 'Molemole Mining Museum', 'indoor', 600, 'Molemole Municipality', 'museum@molemole.gov.za', 'Mogwadi, Molemole', '{"Exhibition Halls", "Mining History Display", "Educational Center", "Gift Shop"}', '/images/venues/molemole-mining-museum.jpg', NOW(), 'molemole'),

('lepel-nkumpi-community-center', 'Lepelle-Nkumpi Community Center', 'indoor', 400, 'Lepelle-Nkumpi Municipality', 'community@lepel.gov.za', 'Ga-Mothiba, Lepelle-Nkumpi', '{"Meeting Rooms", "Kitchen", "Computer Lab", "Library"}', '/images/venues/lepel-nkumpi-community-center.jpg', NOW(), 'lepel');
