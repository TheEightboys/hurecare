-- Migration: Add Test Patients for Dashboard Testing
-- These test patients allow testing of scheduling, clinical notes, and other workflows

INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email, address, blood_type, insurance_provider, insurance_policy_number, emergency_contact_name, emergency_contact_phone)
VALUES 
  ('Grace', 'Wanjiku', '1985-03-15', 'Female', '+254 711 123 456', 'grace.wanjiku@email.com', '123 Ngong Road, Nairobi', 'O+', 'NHIF', 'NHIF-2024-001', 'James Wanjiku', '+254 722 111 222'),
  ('Peter', 'Ochieng', '1978-07-22', 'Male', '+254 722 234 567', 'peter.ochieng@email.com', '45 Mombasa Road, Nairobi', 'A+', 'Jubilee Insurance', 'JUB-2024-1234', 'Mary Ochieng', '+254 733 222 333'),
  ('Amina', 'Hassan', '1992-11-08', 'Female', '+254 733 345 678', 'amina.hassan@email.com', '78 Eastleigh, Nairobi', 'B+', 'AAR Insurance', 'AAR-2024-5678', 'Ahmed Hassan', '+254 744 333 444'),
  ('David', 'Mutua', '1965-01-30', 'Male', '+254 744 456 789', 'david.mutua@email.com', '12 Karen Road, Nairobi', 'AB+', 'Britam Insurance', 'BRT-2024-9012', 'Susan Mutua', '+254 755 444 555'),
  ('Faith', 'Njeri', '2001-05-17', 'Female', '+254 755 567 890', 'faith.njeri@email.com', '34 Thika Road, Nairobi', 'O-', 'Self-Pay', NULL, 'John Njeri', '+254 766 555 666'),
  ('Samuel', 'Kipchoge', '1988-09-12', 'Male', '+254 766 678 901', 'samuel.kipchoge@email.com', '56 Eldoret Highway, Eldoret', 'A-', 'CIC Insurance', 'CIC-2024-3456', 'Ruth Kipchoge', '+254 777 666 777'),
  ('Esther', 'Akinyi', '1995-12-25', 'Female', '+254 777 789 012', 'esther.akinyi@email.com', '89 Kisumu Road, Kisumu', 'B-', 'Madison Insurance', 'MAD-2024-7890', 'Joseph Akinyi', '+254 788 777 888'),
  ('Michael', 'Njoroge', '1972-04-03', 'Male', '+254 788 890 123', 'michael.njoroge@email.com', '23 Westlands, Nairobi', 'AB-', 'Resolution Insurance', 'RES-2024-2345', 'Jane Njoroge', '+254 799 888 999'),
  ('Lucy', 'Mwende', '1998-08-19', 'Female', '+254 799 901 234', 'lucy.mwende@email.com', '67 Meru Town, Meru', 'O+', 'APA Insurance', 'APA-2024-6789', 'Daniel Mwende', '+254 700 999 000'),
  ('Joseph', 'Otieno', '1955-02-28', 'Male', '+254 700 012 345', 'joseph.otieno@email.com', '90 Nakuru Town, Nakuru', 'A+', 'UAP Old Mutual', 'UAP-2024-0123', 'Margaret Otieno', '+254 711 000 111')
ON CONFLICT DO NOTHING;

-- Add some with allergies
UPDATE patients SET allergies = ARRAY['Penicillin', 'Sulfa'] WHERE last_name = 'Wanjiku';
UPDATE patients SET allergies = ARRAY['Aspirin'] WHERE last_name = 'Ochieng';
UPDATE patients SET allergies = ARRAY['Latex', 'Iodine', 'Shellfish'] WHERE last_name = 'Mutua';
UPDATE patients SET allergies = ARRAY['None Known'] WHERE last_name = 'Njeri';
