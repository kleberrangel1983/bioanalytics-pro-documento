import type { Patient, Sample, Analysis, Report, KPIMetric } from './types'

export const MOCK_PATIENTS: Patient[] = [
  { id: 'p1', code: 'PAC-001', age: 45, sex: 'M', diagnosis: 'Leucemia Mieloide' },
  { id: 'p2', code: 'PAC-002', age: 32, sex: 'F', diagnosis: 'Anemia Hemolítica' },
  { id: 'p3', code: 'PAC-003', age: 58, sex: 'M', diagnosis: 'Linfoma de Hodgkin' },
  { id: 'p4', code: 'PAC-004', age: 27, sex: 'F', diagnosis: 'Trombocitopenia' },
  { id: 'p5', code: 'PAC-005', age: 63, sex: 'M', diagnosis: 'Mieloma Múltiplo' },
  { id: 'p6', code: 'PAC-006', age: 41, sex: 'F', diagnosis: 'Linfoma Não-Hodgkin' },
  { id: 'p7', code: 'PAC-007', age: 55, sex: 'M', diagnosis: 'Policitemia Vera' },
  { id: 'p8', code: 'PAC-008', age: 38, sex: 'F', diagnosis: 'Anemia Falciforme' },
  { id: 'p9', code: 'PAC-009', age: 71, sex: 'M', diagnosis: 'Leucemia Linfocítica' },
  { id: 'p10', code: 'PAC-010', age: 29, sex: 'F', diagnosis: 'Hemofilia A' },
  { id: 'p11', code: 'PAC-011', age: 52, sex: 'M', diagnosis: 'Trombose Venosa' },
  { id: 'p12', code: 'PAC-012', age: 44, sex: 'F', diagnosis: 'Porfiria' },
  { id: 'p13', code: 'PAC-013', age: 66, sex: 'M', diagnosis: 'Amiloidose' },
  { id: 'p14', code: 'PAC-014', age: 35, sex: 'F', diagnosis: 'Talassemia Beta' },
  { id: 'p15', code: 'PAC-015', age: 48, sex: 'M', diagnosis: 'Doença de Gaucher' },
  { id: 'p16', code: 'PAC-016', age: 23, sex: 'F', diagnosis: 'Neutropenia' },
  { id: 'p17', code: 'PAC-017', age: 59, sex: 'M', diagnosis: 'Síndrome Mielodisplásica' },
  { id: 'p18', code: 'PAC-018', age: 34, sex: 'F', diagnosis: 'Macroglobulinemia' },
  { id: 'p19', code: 'PAC-019', age: 76, sex: 'M', diagnosis: 'Leucemia Megacarioblástica' },
  { id: 'p20', code: 'PAC-020', age: 42, sex: 'F', diagnosis: 'Eritroblastopenia' },
]

export const MOCK_SAMPLES: Sample[] = [
  { id: 's1', code: 'AMS-001', type: 'blood', status: 'completed', collectedAt: '2026-04-20T08:00:00Z', patientId: 'p1', analysisIds: ['a1', 'a2'], storageTemp: -80, createdAt: '2026-04-20T08:30:00Z' },
  { id: 's2', code: 'AMS-002', type: 'tissue', status: 'processing', collectedAt: '2026-04-21T09:00:00Z', patientId: 'p2', analysisIds: ['a3'], storageTemp: -20, createdAt: '2026-04-21T09:30:00Z' },
  { id: 's3', code: 'AMS-003', type: 'urine', status: 'pending', collectedAt: '2026-04-22T10:00:00Z', patientId: 'p3', analysisIds: [], storageTemp: 4, createdAt: '2026-04-22T10:30:00Z' },
  { id: 's4', code: 'AMS-004', type: 'blood', status: 'completed', collectedAt: '2026-04-22T11:00:00Z', patientId: 'p4', analysisIds: ['a4', 'a5'], storageTemp: -80, createdAt: '2026-04-22T11:30:00Z' },
  { id: 's5', code: 'AMS-005', type: 'saliva', status: 'failed', collectedAt: '2026-04-23T08:00:00Z', patientId: 'p5', analysisIds: ['a6'], storageTemp: -20, createdAt: '2026-04-23T08:30:00Z', notes: 'Amostra contaminada' },
  { id: 's6', code: 'AMS-006', type: 'csf', status: 'processing', collectedAt: '2026-04-23T13:00:00Z', patientId: 'p6', analysisIds: ['a7'], storageTemp: -80, createdAt: '2026-04-23T13:30:00Z' },
  { id: 's7', code: 'AMS-007', type: 'biopsy', status: 'completed', collectedAt: '2026-04-24T08:00:00Z', patientId: 'p7', analysisIds: ['a8', 'a9', 'a10'], storageTemp: -20, createdAt: '2026-04-24T08:30:00Z' },
  { id: 's8', code: 'AMS-008', type: 'blood', status: 'pending', collectedAt: '2026-04-24T14:00:00Z', patientId: 'p8', analysisIds: [], storageTemp: 4, createdAt: '2026-04-24T14:30:00Z' },
  { id: 's9', code: 'AMS-009', type: 'tissue', status: 'archived', collectedAt: '2026-03-15T08:00:00Z', patientId: 'p9', analysisIds: ['a11'], storageTemp: -80, createdAt: '2026-03-15T08:30:00Z' },
  { id: 's10', code: 'AMS-010', type: 'blood', status: 'completed', collectedAt: '2026-04-25T09:00:00Z', patientId: 'p10', analysisIds: ['a12', 'a13'], storageTemp: -80, createdAt: '2026-04-25T09:30:00Z' },
  { id: 's11', code: 'AMS-011', type: 'urine', status: 'processing', collectedAt: '2026-04-25T10:00:00Z', patientId: 'p11', analysisIds: ['a14'], storageTemp: 4, createdAt: '2026-04-25T10:30:00Z' },
  { id: 's12', code: 'AMS-012', type: 'saliva', status: 'completed', collectedAt: '2026-04-25T11:00:00Z', patientId: 'p12', analysisIds: ['a15', 'a16'], storageTemp: -20, createdAt: '2026-04-25T11:30:00Z' },
  { id: 's13', code: 'AMS-013', type: 'blood', status: 'pending', collectedAt: '2026-04-26T08:00:00Z', patientId: 'p13', analysisIds: [], storageTemp: 4, createdAt: '2026-04-26T08:30:00Z' },
  { id: 's14', code: 'AMS-014', type: 'csf', status: 'failed', collectedAt: '2026-04-26T09:00:00Z', patientId: 'p14', analysisIds: ['a17'], storageTemp: -80, createdAt: '2026-04-26T09:30:00Z', notes: 'Volume insuficiente' },
  { id: 's15', code: 'AMS-015', type: 'biopsy', status: 'completed', collectedAt: '2026-04-26T10:00:00Z', patientId: 'p15', analysisIds: ['a18', 'a19'], storageTemp: -20, createdAt: '2026-04-26T10:30:00Z' },
  { id: 's16', code: 'AMS-016', type: 'blood', status: 'processing', collectedAt: '2026-04-27T08:00:00Z', patientId: 'p16', analysisIds: ['a20'], storageTemp: -80, createdAt: '2026-04-27T08:30:00Z' },
  { id: 's17', code: 'AMS-017', type: 'tissue', status: 'completed', collectedAt: '2026-04-27T09:00:00Z', patientId: 'p17', analysisIds: ['a21', 'a22'], storageTemp: -20, createdAt: '2026-04-27T09:30:00Z' },
  { id: 's18', code: 'AMS-018', type: 'urine', status: 'pending', collectedAt: '2026-04-27T10:00:00Z', patientId: 'p18', analysisIds: [], storageTemp: 4, createdAt: '2026-04-27T10:30:00Z' },
  { id: 's19', code: 'AMS-019', type: 'blood', status: 'completed', collectedAt: '2026-04-28T08:00:00Z', patientId: 'p19', analysisIds: ['a23', 'a24', 'a25'], storageTemp: -80, createdAt: '2026-04-28T08:30:00Z' },
  { id: 's20', code: 'AMS-020', type: 'saliva', status: 'archived', collectedAt: '2026-02-10T08:00:00Z', patientId: 'p20', analysisIds: ['a26'], storageTemp: -20, createdAt: '2026-02-10T08:30:00Z' },
  { id: 's21', code: 'AMS-021', type: 'blood', status: 'pending', collectedAt: '2026-04-28T09:00:00Z', patientId: 'p1', analysisIds: [], storageTemp: 4, createdAt: '2026-04-28T09:30:00Z' },
  { id: 's22', code: 'AMS-022', type: 'tissue', status: 'processing', collectedAt: '2026-04-28T10:00:00Z', patientId: 'p2', analysisIds: ['a27'], storageTemp: -20, createdAt: '2026-04-28T10:30:00Z' },
  { id: 's23', code: 'AMS-023', type: 'csf', status: 'completed', collectedAt: '2026-04-29T08:00:00Z', patientId: 'p3', analysisIds: ['a28', 'a29'], storageTemp: -80, createdAt: '2026-04-29T08:30:00Z' },
  { id: 's24', code: 'AMS-024', type: 'biopsy', status: 'failed', collectedAt: '2026-04-29T09:00:00Z', patientId: 'p4', analysisIds: ['a30'], storageTemp: -20, createdAt: '2026-04-29T09:30:00Z', notes: 'Amostra degradada' },
  { id: 's25', code: 'AMS-025', type: 'blood', status: 'completed', collectedAt: '2026-04-29T10:00:00Z', patientId: 'p5', analysisIds: ['a31', 'a32'], storageTemp: -80, createdAt: '2026-04-29T10:30:00Z' },
  { id: 's26', code: 'AMS-026', type: 'urine', status: 'pending', collectedAt: '2026-04-30T08:00:00Z', patientId: 'p6', analysisIds: [], storageTemp: 4, createdAt: '2026-04-30T08:30:00Z' },
  { id: 's27', code: 'AMS-027', type: 'saliva', status: 'processing', collectedAt: '2026-04-30T09:00:00Z', patientId: 'p7', analysisIds: ['a33'], storageTemp: -20, createdAt: '2026-04-30T09:30:00Z' },
  { id: 's28', code: 'AMS-028', type: 'blood', status: 'completed', collectedAt: '2026-04-30T10:00:00Z', patientId: 'p8', analysisIds: ['a34', 'a35'], storageTemp: -80, createdAt: '2026-04-30T10:30:00Z' },
  { id: 's29', code: 'AMS-029', type: 'tissue', status: 'archived', collectedAt: '2026-01-20T08:00:00Z', patientId: 'p9', analysisIds: ['a36'], storageTemp: -20, createdAt: '2026-01-20T08:30:00Z' },
  { id: 's30', code: 'AMS-030', type: 'blood', status: 'pending', collectedAt: '2026-05-01T08:00:00Z', patientId: 'p10', analysisIds: [], storageTemp: 4, createdAt: '2026-05-01T08:30:00Z' },
  { id: 's31', code: 'AMS-031', type: 'csf', status: 'processing', collectedAt: '2026-05-01T09:00:00Z', patientId: 'p11', analysisIds: ['a37'], storageTemp: -80, createdAt: '2026-05-01T09:30:00Z' },
  { id: 's32', code: 'AMS-032', type: 'biopsy', status: 'completed', collectedAt: '2026-05-01T10:00:00Z', patientId: 'p12', analysisIds: ['a38', 'a39', 'a40'], storageTemp: -20, createdAt: '2026-05-01T10:30:00Z' },
  { id: 's33', code: 'AMS-033', type: 'blood', status: 'failed', collectedAt: '2026-05-02T08:00:00Z', patientId: 'p13', analysisIds: ['a41'], storageTemp: -80, createdAt: '2026-05-02T08:30:00Z', notes: 'Hemólise detectada' },
  { id: 's34', code: 'AMS-034', type: 'urine', status: 'completed', collectedAt: '2026-05-02T09:00:00Z', patientId: 'p14', analysisIds: ['a42', 'a43'], storageTemp: 4, createdAt: '2026-05-02T09:30:00Z' },
  { id: 's35', code: 'AMS-035', type: 'saliva', status: 'pending', collectedAt: '2026-05-02T10:00:00Z', patientId: 'p15', analysisIds: [], storageTemp: -20, createdAt: '2026-05-02T10:30:00Z' },
  { id: 's36', code: 'AMS-036', type: 'blood', status: 'processing', collectedAt: '2026-05-03T08:00:00Z', patientId: 'p16', analysisIds: ['a44'], storageTemp: -80, createdAt: '2026-05-03T08:30:00Z' },
  { id: 's37', code: 'AMS-037', type: 'tissue', status: 'completed', collectedAt: '2026-05-03T09:00:00Z', patientId: 'p17', analysisIds: ['a45', 'a46'], storageTemp: -20, createdAt: '2026-05-03T09:30:00Z' },
  { id: 's38', code: 'AMS-038', type: 'csf', status: 'pending', collectedAt: '2026-05-03T10:00:00Z', patientId: 'p18', analysisIds: [], storageTemp: -80, createdAt: '2026-05-03T10:30:00Z' },
  { id: 's39', code: 'AMS-039', type: 'blood', status: 'completed', collectedAt: '2026-05-04T08:00:00Z', patientId: 'p19', analysisIds: ['a47', 'a48'], storageTemp: -80, createdAt: '2026-05-04T08:30:00Z' },
  { id: 's40', code: 'AMS-040', type: 'biopsy', status: 'processing', collectedAt: '2026-05-04T09:00:00Z', patientId: 'p20', analysisIds: ['a49'], storageTemp: -20, createdAt: '2026-05-04T09:30:00Z' },
  { id: 's41', code: 'AMS-041', type: 'blood', status: 'pending', collectedAt: '2026-05-04T10:00:00Z', patientId: 'p1', analysisIds: [], storageTemp: 4, createdAt: '2026-05-04T10:30:00Z' },
  { id: 's42', code: 'AMS-042', type: 'urine', status: 'completed', collectedAt: '2026-05-04T11:00:00Z', patientId: 'p2', analysisIds: ['a50', 'a51'], storageTemp: 4, createdAt: '2026-05-04T11:30:00Z' },
  { id: 's43', code: 'AMS-043', type: 'saliva', status: 'failed', collectedAt: '2026-05-05T08:00:00Z', patientId: 'p3', analysisIds: ['a52'], storageTemp: -20, createdAt: '2026-05-05T08:30:00Z', notes: 'pH fora do padrão' },
  { id: 's44', code: 'AMS-044', type: 'blood', status: 'processing', collectedAt: '2026-05-05T09:00:00Z', patientId: 'p4', analysisIds: ['a53'], storageTemp: -80, createdAt: '2026-05-05T09:30:00Z' },
  { id: 's45', code: 'AMS-045', type: 'tissue', status: 'completed', collectedAt: '2026-05-05T10:00:00Z', patientId: 'p5', analysisIds: ['a54', 'a55', 'a56'], storageTemp: -20, createdAt: '2026-05-05T10:30:00Z' },
  { id: 's46', code: 'AMS-046', type: 'blood', status: 'pending', collectedAt: '2026-05-05T11:00:00Z', patientId: 'p6', analysisIds: [], storageTemp: 4, createdAt: '2026-05-05T11:30:00Z' },
  { id: 's47', code: 'AMS-047', type: 'csf', status: 'completed', collectedAt: '2026-05-06T08:00:00Z', patientId: 'p7', analysisIds: ['a57', 'a58'], storageTemp: -80, createdAt: '2026-05-06T08:30:00Z' },
  { id: 's48', code: 'AMS-048', type: 'biopsy', status: 'pending', collectedAt: '2026-05-06T09:00:00Z', patientId: 'p8', analysisIds: [], storageTemp: -20, createdAt: '2026-05-06T09:30:00Z' },
  { id: 's49', code: 'AMS-049', type: 'blood', status: 'processing', collectedAt: '2026-05-06T10:00:00Z', patientId: 'p9', analysisIds: ['a59'], storageTemp: -80, createdAt: '2026-05-06T10:30:00Z' },
  { id: 's50', code: 'AMS-050', type: 'urine', status: 'completed', collectedAt: '2026-05-06T11:00:00Z', patientId: 'p10', analysisIds: ['a60', 'a61'], storageTemp: 4, createdAt: '2026-05-06T11:30:00Z' },
  { id: 's51', code: 'AMS-051', type: 'blood', status: 'pending', collectedAt: '2026-05-06T12:00:00Z', patientId: 'p11', analysisIds: [], storageTemp: 4, createdAt: '2026-05-06T12:30:00Z' },
  { id: 's52', code: 'AMS-052', type: 'tissue', status: 'processing', collectedAt: '2026-05-06T13:00:00Z', patientId: 'p12', analysisIds: ['a62'], storageTemp: -20, createdAt: '2026-05-06T13:30:00Z' },
  { id: 's53', code: 'AMS-053', type: 'saliva', status: 'completed', collectedAt: '2026-05-06T14:00:00Z', patientId: 'p13', analysisIds: ['a63', 'a64'], storageTemp: -20, createdAt: '2026-05-06T14:30:00Z' },
  { id: 's54', code: 'AMS-054', type: 'blood', status: 'failed', collectedAt: '2026-05-06T15:00:00Z', patientId: 'p14', analysisIds: ['a65'], storageTemp: -80, createdAt: '2026-05-06T15:30:00Z', notes: 'Coagulação prematura' },
  { id: 's55', code: 'AMS-055', type: 'csf', status: 'pending', collectedAt: '2026-05-06T16:00:00Z', patientId: 'p15', analysisIds: [], storageTemp: -80, createdAt: '2026-05-06T16:30:00Z' },
  { id: 's56', code: 'AMS-056', type: 'biopsy', status: 'completed', collectedAt: '2026-04-15T08:00:00Z', patientId: 'p16', analysisIds: ['a66', 'a67'], storageTemp: -20, createdAt: '2026-04-15T08:30:00Z' },
  { id: 's57', code: 'AMS-057', type: 'blood', status: 'processing', collectedAt: '2026-04-16T08:00:00Z', patientId: 'p17', analysisIds: ['a68'], storageTemp: -80, createdAt: '2026-04-16T08:30:00Z' },
  { id: 's58', code: 'AMS-058', type: 'urine', status: 'archived', collectedAt: '2026-03-01T08:00:00Z', patientId: 'p18', analysisIds: ['a69'], storageTemp: 4, createdAt: '2026-03-01T08:30:00Z' },
  { id: 's59', code: 'AMS-059', type: 'tissue', status: 'completed', collectedAt: '2026-04-17T08:00:00Z', patientId: 'p19', analysisIds: ['a70', 'a71', 'a72'], storageTemp: -20, createdAt: '2026-04-17T08:30:00Z' },
  { id: 's60', code: 'AMS-060', type: 'blood', status: 'pending', collectedAt: '2026-05-06T17:00:00Z', patientId: 'p20', analysisIds: [], storageTemp: 4, createdAt: '2026-05-06T17:30:00Z' },
  { id: 's61', code: 'AMS-061', type: 'saliva', status: 'completed', collectedAt: '2026-04-10T08:00:00Z', patientId: 'p1', analysisIds: ['a73'], storageTemp: -20, createdAt: '2026-04-10T08:30:00Z' },
  { id: 's62', code: 'AMS-062', type: 'csf', status: 'processing', collectedAt: '2026-04-11T08:00:00Z', patientId: 'p2', analysisIds: ['a74'], storageTemp: -80, createdAt: '2026-04-11T08:30:00Z' },
  { id: 's63', code: 'AMS-063', type: 'blood', status: 'completed', collectedAt: '2026-04-12T08:00:00Z', patientId: 'p3', analysisIds: ['a75', 'a76'], storageTemp: -80, createdAt: '2026-04-12T08:30:00Z' },
  { id: 's64', code: 'AMS-064', type: 'biopsy', status: 'failed', collectedAt: '2026-04-13T08:00:00Z', patientId: 'p4', analysisIds: ['a77'], storageTemp: -20, createdAt: '2026-04-13T08:30:00Z', notes: 'Material insuficiente' },
  { id: 's65', code: 'AMS-065', type: 'urine', status: 'archived', collectedAt: '2026-02-20T08:00:00Z', patientId: 'p5', analysisIds: ['a78'], storageTemp: 4, createdAt: '2026-02-20T08:30:00Z' },
  { id: 's66', code: 'AMS-066', type: 'blood', status: 'pending', collectedAt: '2026-05-06T18:00:00Z', patientId: 'p6', analysisIds: [], storageTemp: 4, createdAt: '2026-05-06T18:30:00Z' },
  { id: 's67', code: 'AMS-067', type: 'tissue', status: 'completed', collectedAt: '2026-04-14T08:00:00Z', patientId: 'p7', analysisIds: ['a79', 'a80'], storageTemp: -20, createdAt: '2026-04-14T08:30:00Z' },
  { id: 's68', code: 'AMS-068', type: 'blood', status: 'processing', collectedAt: '2026-04-18T08:00:00Z', patientId: 'p8', analysisIds: ['a81'], storageTemp: -80, createdAt: '2026-04-18T08:30:00Z' },
  { id: 's69', code: 'AMS-069', type: 'saliva', status: 'completed', collectedAt: '2026-04-19T08:00:00Z', patientId: 'p9', analysisIds: ['a82', 'a83'], storageTemp: -20, createdAt: '2026-04-19T08:30:00Z' },
  { id: 's70', code: 'AMS-070', type: 'csf', status: 'pending', collectedAt: '2026-05-06T19:00:00Z', patientId: 'p10', analysisIds: [], storageTemp: -80, createdAt: '2026-05-06T19:30:00Z' },
  { id: 's71', code: 'AMS-071', type: 'biopsy', status: 'completed', collectedAt: '2026-04-08T08:00:00Z', patientId: 'p11', analysisIds: ['a84', 'a85'], storageTemp: -20, createdAt: '2026-04-08T08:30:00Z' },
  { id: 's72', code: 'AMS-072', type: 'blood', status: 'failed', collectedAt: '2026-04-09T08:00:00Z', patientId: 'p12', analysisIds: ['a86'], storageTemp: -80, createdAt: '2026-04-09T08:30:00Z', notes: 'Temperatura de armazenamento incorreta' },
  { id: 's73', code: 'AMS-073', type: 'urine', status: 'processing', collectedAt: '2026-05-05T12:00:00Z', patientId: 'p13', analysisIds: ['a87'], storageTemp: 4, createdAt: '2026-05-05T12:30:00Z' },
  { id: 's74', code: 'AMS-074', type: 'tissue', status: 'completed', collectedAt: '2026-04-07T08:00:00Z', patientId: 'p14', analysisIds: ['a88', 'a89', 'a90'], storageTemp: -20, createdAt: '2026-04-07T08:30:00Z' },
  { id: 's75', code: 'AMS-075', type: 'blood', status: 'pending', collectedAt: '2026-05-06T20:00:00Z', patientId: 'p15', analysisIds: [], storageTemp: 4, createdAt: '2026-05-06T20:30:00Z' },
  { id: 's76', code: 'AMS-076', type: 'saliva', status: 'archived', collectedAt: '2026-01-10T08:00:00Z', patientId: 'p16', analysisIds: ['a91'], storageTemp: -20, createdAt: '2026-01-10T08:30:00Z' },
  { id: 's77', code: 'AMS-077', type: 'csf', status: 'completed', collectedAt: '2026-04-06T08:00:00Z', patientId: 'p17', analysisIds: ['a92', 'a93'], storageTemp: -80, createdAt: '2026-04-06T08:30:00Z' },
  { id: 's78', code: 'AMS-078', type: 'blood', status: 'processing', collectedAt: '2026-05-05T13:00:00Z', patientId: 'p18', analysisIds: ['a94'], storageTemp: -80, createdAt: '2026-05-05T13:30:00Z' },
  { id: 's79', code: 'AMS-079', type: 'biopsy', status: 'completed', collectedAt: '2026-04-05T08:00:00Z', patientId: 'p19', analysisIds: ['a95', 'a96'], storageTemp: -20, createdAt: '2026-04-05T08:30:00Z' },
  { id: 's80', code: 'AMS-080', type: 'urine', status: 'pending', collectedAt: '2026-05-06T21:00:00Z', patientId: 'p20', analysisIds: [], storageTemp: 4, createdAt: '2026-05-06T21:30:00Z' },
]

export const MOCK_ANALYSES: Analysis[] = [
  { id: 'a1', sampleId: 's1', type: 'pcr', concentration: 2.45, viability: 94.2, purity: 1.82, ph: 7.4, temperature: -80, performedAt: '2026-04-20T14:00:00Z' },
  { id: 'a2', sampleId: 's1', type: 'elisa', concentration: 1.87, viability: 91.5, purity: 1.75, ph: 7.3, temperature: -80, performedAt: '2026-04-20T16:00:00Z' },
  { id: 'a3', sampleId: 's2', type: 'flow-cytometry', concentration: 3.12, viability: 65.3, purity: 1.91, ph: 7.2, temperature: -20, performedAt: '2026-04-21T14:00:00Z', notes: 'Viabilidade abaixo do threshold' },
  { id: 'a4', sampleId: 's4', type: 'pcr', concentration: 2.91, viability: 88.7, purity: 1.88, ph: 7.5, temperature: -80, performedAt: '2026-04-22T14:00:00Z' },
  { id: 'a5', sampleId: 's4', type: 'sequencing', concentration: 2.15, viability: 92.1, purity: 1.95, ph: 7.4, temperature: -80, performedAt: '2026-04-22T16:00:00Z' },
  { id: 'a6', sampleId: 's5', type: 'microscopy', concentration: 0.85, viability: 42.3, purity: 1.21, ph: 6.8, temperature: -20, performedAt: '2026-04-23T10:00:00Z', notes: 'Amostra contaminada, resultado inválido' },
  { id: 'a7', sampleId: 's6', type: 'pcr', concentration: 1.95, viability: 78.4, purity: 1.72, ph: 7.1, temperature: -80, performedAt: '2026-04-23T15:00:00Z' },
  { id: 'a8', sampleId: 's7', type: 'elisa', concentration: 3.45, viability: 95.8, purity: 1.98, ph: 7.6, temperature: -20, performedAt: '2026-04-24T10:00:00Z' },
  { id: 'a9', sampleId: 's7', type: 'flow-cytometry', concentration: 2.78, viability: 93.2, purity: 1.87, ph: 7.4, temperature: -20, performedAt: '2026-04-24T12:00:00Z' },
  { id: 'a10', sampleId: 's7', type: 'microscopy', concentration: 2.34, viability: 96.1, purity: 1.94, ph: 7.5, temperature: -20, performedAt: '2026-04-24T14:00:00Z' },
  { id: 'a11', sampleId: 's9', type: 'pcr', concentration: 1.23, viability: 71.5, purity: 1.65, ph: 7.2, temperature: -80, performedAt: '2026-03-15T14:00:00Z' },
  { id: 'a12', sampleId: 's10', type: 'elisa', concentration: 2.67, viability: 89.4, purity: 1.83, ph: 7.4, temperature: -80, performedAt: '2026-04-25T12:00:00Z' },
  { id: 'a13', sampleId: 's10', type: 'sequencing', concentration: 2.11, viability: 91.8, purity: 1.92, ph: 7.3, temperature: -80, performedAt: '2026-04-25T14:00:00Z' },
  { id: 'a14', sampleId: 's11', type: 'pcr', concentration: 1.78, viability: 76.2, purity: 1.69, ph: 7.1, temperature: 4, performedAt: '2026-04-25T16:00:00Z' },
  { id: 'a15', sampleId: 's12', type: 'flow-cytometry', concentration: 3.02, viability: 87.6, purity: 1.86, ph: 7.4, temperature: -20, performedAt: '2026-04-25T10:00:00Z' },
  { id: 'a16', sampleId: 's12', type: 'microscopy', concentration: 2.54, viability: 90.3, purity: 1.79, ph: 7.5, temperature: -20, performedAt: '2026-04-25T12:00:00Z' },
  { id: 'a17', sampleId: 's14', type: 'pcr', concentration: 0.45, viability: 35.8, purity: 0.98, ph: 6.5, temperature: -80, performedAt: '2026-04-26T11:00:00Z', notes: 'Volume insuficiente para análise' },
  { id: 'a18', sampleId: 's15', type: 'elisa', concentration: 3.21, viability: 94.7, purity: 1.96, ph: 7.5, temperature: -20, performedAt: '2026-04-26T12:00:00Z' },
  { id: 'a19', sampleId: 's15', type: 'sequencing', concentration: 2.89, viability: 93.4, purity: 1.91, ph: 7.4, temperature: -20, performedAt: '2026-04-26T14:00:00Z' },
  { id: 'a20', sampleId: 's16', type: 'pcr', concentration: 2.34, viability: 82.1, purity: 1.78, ph: 7.3, temperature: -80, performedAt: '2026-04-27T10:00:00Z' },
  { id: 'a21', sampleId: 's17', type: 'flow-cytometry', concentration: 2.76, viability: 91.2, purity: 1.89, ph: 7.4, temperature: -20, performedAt: '2026-04-27T11:00:00Z' },
  { id: 'a22', sampleId: 's17', type: 'microscopy', concentration: 2.43, viability: 88.9, purity: 1.84, ph: 7.5, temperature: -20, performedAt: '2026-04-27T13:00:00Z' },
  { id: 'a23', sampleId: 's19', type: 'pcr', concentration: 3.15, viability: 96.3, purity: 1.97, ph: 7.6, temperature: -80, performedAt: '2026-04-28T10:00:00Z' },
  { id: 'a24', sampleId: 's19', type: 'elisa', concentration: 2.87, viability: 94.1, purity: 1.93, ph: 7.4, temperature: -80, performedAt: '2026-04-28T12:00:00Z' },
  { id: 'a25', sampleId: 's19', type: 'sequencing', concentration: 2.65, viability: 95.7, purity: 1.98, ph: 7.5, temperature: -80, performedAt: '2026-04-28T14:00:00Z' },
  { id: 'a26', sampleId: 's20', type: 'microscopy', concentration: 1.45, viability: 68.4, purity: 1.54, ph: 7.0, temperature: -20, performedAt: '2026-02-10T14:00:00Z' },
  { id: 'a27', sampleId: 's22', type: 'pcr', concentration: 2.01, viability: 79.5, purity: 1.74, ph: 7.2, temperature: -20, performedAt: '2026-04-28T16:00:00Z' },
  { id: 'a28', sampleId: 's23', type: 'elisa', concentration: 2.78, viability: 90.8, purity: 1.87, ph: 7.4, temperature: -80, performedAt: '2026-04-29T10:00:00Z' },
  { id: 'a29', sampleId: 's23', type: 'flow-cytometry', concentration: 2.34, viability: 88.3, purity: 1.81, ph: 7.3, temperature: -80, performedAt: '2026-04-29T12:00:00Z' },
  { id: 'a30', sampleId: 's24', type: 'pcr', concentration: 0.67, viability: 28.9, purity: 1.12, ph: 6.3, temperature: -20, performedAt: '2026-04-29T11:00:00Z', notes: 'Amostra degradada' },
  { id: 'a31', sampleId: 's25', type: 'elisa', concentration: 2.98, viability: 93.6, purity: 1.94, ph: 7.5, temperature: -80, performedAt: '2026-04-29T14:00:00Z' },
  { id: 'a32', sampleId: 's25', type: 'sequencing', concentration: 2.72, viability: 91.9, purity: 1.90, ph: 7.4, temperature: -80, performedAt: '2026-04-29T16:00:00Z' },
  { id: 'a33', sampleId: 's27', type: 'microscopy', concentration: 1.87, viability: 77.3, purity: 1.71, ph: 7.2, temperature: -20, performedAt: '2026-04-30T12:00:00Z' },
  { id: 'a34', sampleId: 's28', type: 'pcr', concentration: 2.56, viability: 86.4, purity: 1.82, ph: 7.4, temperature: -80, performedAt: '2026-04-30T12:00:00Z' },
  { id: 'a35', sampleId: 's28', type: 'elisa', concentration: 2.31, viability: 84.7, purity: 1.78, ph: 7.3, temperature: -80, performedAt: '2026-04-30T14:00:00Z' },
  { id: 'a36', sampleId: 's29', type: 'flow-cytometry', concentration: 1.67, viability: 72.8, purity: 1.63, ph: 7.1, temperature: -20, performedAt: '2026-01-20T14:00:00Z' },
  { id: 'a37', sampleId: 's31', type: 'pcr', concentration: 2.12, viability: 81.5, purity: 1.76, ph: 7.3, temperature: -80, performedAt: '2026-05-01T12:00:00Z' },
  { id: 'a38', sampleId: 's32', type: 'elisa', concentration: 3.34, viability: 95.2, purity: 1.97, ph: 7.6, temperature: -20, performedAt: '2026-05-01T12:00:00Z' },
  { id: 'a39', sampleId: 's32', type: 'sequencing', concentration: 3.01, viability: 94.6, purity: 1.95, ph: 7.5, temperature: -20, performedAt: '2026-05-01T14:00:00Z' },
  { id: 'a40', sampleId: 's32', type: 'microscopy', concentration: 2.89, viability: 93.8, purity: 1.93, ph: 7.4, temperature: -20, performedAt: '2026-05-01T16:00:00Z' },
  { id: 'a41', sampleId: 's33', type: 'flow-cytometry', concentration: 0.78, viability: 38.2, purity: 1.05, ph: 6.6, temperature: -80, performedAt: '2026-05-02T10:00:00Z', notes: 'Hemólise detectada' },
  { id: 'a42', sampleId: 's34', type: 'pcr', concentration: 1.95, viability: 83.7, purity: 1.79, ph: 7.3, temperature: 4, performedAt: '2026-05-02T11:00:00Z' },
  { id: 'a43', sampleId: 's34', type: 'elisa', concentration: 1.72, viability: 81.4, purity: 1.75, ph: 7.2, temperature: 4, performedAt: '2026-05-02T13:00:00Z' },
  { id: 'a44', sampleId: 's36', type: 'sequencing', concentration: 2.43, viability: 84.9, purity: 1.81, ph: 7.4, temperature: -80, performedAt: '2026-05-03T12:00:00Z' },
  { id: 'a45', sampleId: 's37', type: 'pcr', concentration: 2.87, viability: 92.3, purity: 1.91, ph: 7.5, temperature: -20, performedAt: '2026-05-03T11:00:00Z' },
  { id: 'a46', sampleId: 's37', type: 'microscopy', concentration: 2.61, viability: 90.7, purity: 1.88, ph: 7.4, temperature: -20, performedAt: '2026-05-03T13:00:00Z' },
  { id: 'a47', sampleId: 's39', type: 'elisa', concentration: 3.07, viability: 95.4, purity: 1.96, ph: 7.6, temperature: -80, performedAt: '2026-05-04T10:00:00Z' },
  { id: 'a48', sampleId: 's39', type: 'flow-cytometry', concentration: 2.83, viability: 93.7, purity: 1.92, ph: 7.5, temperature: -80, performedAt: '2026-05-04T12:00:00Z' },
  { id: 'a49', sampleId: 's40', type: 'pcr', concentration: 2.21, viability: 80.6, purity: 1.77, ph: 7.3, temperature: -20, performedAt: '2026-05-04T14:00:00Z' },
  { id: 'a50', sampleId: 's42', type: 'elisa', concentration: 2.04, viability: 85.3, purity: 1.81, ph: 7.3, temperature: 4, performedAt: '2026-05-04T12:00:00Z' },
  { id: 'a51', sampleId: 's42', type: 'sequencing', concentration: 1.87, viability: 83.6, purity: 1.78, ph: 7.2, temperature: 4, performedAt: '2026-05-04T14:00:00Z' },
  { id: 'a52', sampleId: 's43', type: 'pcr', concentration: 0.56, viability: 31.4, purity: 1.08, ph: 6.4, temperature: -20, performedAt: '2026-05-05T10:00:00Z', notes: 'pH fora do padrão' },
  { id: 'a53', sampleId: 's44', type: 'flow-cytometry', concentration: 2.45, viability: 83.2, purity: 1.79, ph: 7.3, temperature: -80, performedAt: '2026-05-05T11:00:00Z' },
  { id: 'a54', sampleId: 's45', type: 'pcr', concentration: 3.18, viability: 95.6, purity: 1.97, ph: 7.6, temperature: -20, performedAt: '2026-05-05T11:00:00Z' },
  { id: 'a55', sampleId: 's45', type: 'elisa', concentration: 2.94, viability: 94.2, purity: 1.94, ph: 7.5, temperature: -20, performedAt: '2026-05-05T13:00:00Z' },
  { id: 'a56', sampleId: 's45', type: 'microscopy', concentration: 2.71, viability: 92.8, purity: 1.91, ph: 7.4, temperature: -20, performedAt: '2026-05-05T15:00:00Z' },
  { id: 'a57', sampleId: 's47', type: 'sequencing', concentration: 2.67, viability: 91.4, purity: 1.90, ph: 7.4, temperature: -80, performedAt: '2026-05-06T10:00:00Z' },
  { id: 'a58', sampleId: 's47', type: 'pcr', concentration: 2.89, viability: 93.1, purity: 1.93, ph: 7.5, temperature: -80, performedAt: '2026-05-06T12:00:00Z' },
  { id: 'a59', sampleId: 's49', type: 'elisa', concentration: 2.23, viability: 82.7, purity: 1.78, ph: 7.3, temperature: -80, performedAt: '2026-05-06T13:00:00Z' },
  { id: 'a60', sampleId: 's50', type: 'pcr', concentration: 1.89, viability: 84.5, purity: 1.80, ph: 7.3, temperature: 4, performedAt: '2026-05-06T12:00:00Z' },
  { id: 'a61', sampleId: 's50', type: 'flow-cytometry', concentration: 1.67, viability: 82.1, purity: 1.76, ph: 7.2, temperature: 4, performedAt: '2026-05-06T14:00:00Z' },
  { id: 'a62', sampleId: 's52', type: 'microscopy', concentration: 2.34, viability: 80.4, purity: 1.75, ph: 7.3, temperature: -20, performedAt: '2026-05-06T15:00:00Z' },
  { id: 'a63', sampleId: 's53', type: 'elisa', concentration: 2.56, viability: 88.7, purity: 1.84, ph: 7.4, temperature: -20, performedAt: '2026-05-06T14:00:00Z' },
  { id: 'a64', sampleId: 's53', type: 'sequencing', concentration: 2.31, viability: 86.4, purity: 1.81, ph: 7.3, temperature: -20, performedAt: '2026-05-06T16:00:00Z' },
  { id: 'a65', sampleId: 's54', type: 'pcr', concentration: 0.34, viability: 25.6, purity: 0.89, ph: 6.2, temperature: -80, performedAt: '2026-05-06T16:00:00Z', notes: 'Coagulação prematura' },
  { id: 'a66', sampleId: 's56', type: 'flow-cytometry', concentration: 2.78, viability: 91.5, purity: 1.89, ph: 7.4, temperature: -20, performedAt: '2026-04-15T12:00:00Z' },
  { id: 'a67', sampleId: 's56', type: 'microscopy', concentration: 2.54, viability: 89.8, purity: 1.86, ph: 7.4, temperature: -20, performedAt: '2026-04-15T14:00:00Z' },
  { id: 'a68', sampleId: 's57', type: 'pcr', concentration: 2.12, viability: 81.3, purity: 1.76, ph: 7.3, temperature: -80, performedAt: '2026-04-16T12:00:00Z' },
  { id: 'a69', sampleId: 's58', type: 'elisa', concentration: 1.56, viability: 73.2, purity: 1.65, ph: 7.1, temperature: 4, performedAt: '2026-03-01T14:00:00Z' },
  { id: 'a70', sampleId: 's59', type: 'sequencing', concentration: 3.01, viability: 94.8, purity: 1.95, ph: 7.5, temperature: -20, performedAt: '2026-04-17T10:00:00Z' },
  { id: 'a71', sampleId: 's59', type: 'pcr', concentration: 2.87, viability: 93.4, purity: 1.93, ph: 7.5, temperature: -20, performedAt: '2026-04-17T12:00:00Z' },
  { id: 'a72', sampleId: 's59', type: 'elisa', concentration: 2.65, viability: 92.1, purity: 1.90, ph: 7.4, temperature: -20, performedAt: '2026-04-17T14:00:00Z' },
  { id: 'a73', sampleId: 's61', type: 'microscopy', concentration: 2.23, viability: 87.6, purity: 1.83, ph: 7.4, temperature: -20, performedAt: '2026-04-10T12:00:00Z' },
  { id: 'a74', sampleId: 's62', type: 'flow-cytometry', concentration: 1.98, viability: 79.3, purity: 1.73, ph: 7.2, temperature: -80, performedAt: '2026-04-11T12:00:00Z' },
  { id: 'a75', sampleId: 's63', type: 'pcr', concentration: 2.67, viability: 89.7, purity: 1.85, ph: 7.4, temperature: -80, performedAt: '2026-04-12T10:00:00Z' },
  { id: 'a76', sampleId: 's63', type: 'elisa', concentration: 2.43, viability: 87.4, purity: 1.82, ph: 7.3, temperature: -80, performedAt: '2026-04-12T12:00:00Z' },
  { id: 'a77', sampleId: 's64', type: 'sequencing', concentration: 0.89, viability: 45.6, purity: 1.23, ph: 6.7, temperature: -20, performedAt: '2026-04-13T11:00:00Z', notes: 'Material insuficiente' },
  { id: 'a78', sampleId: 's65', type: 'microscopy', concentration: 1.34, viability: 66.8, purity: 1.57, ph: 7.0, temperature: 4, performedAt: '2026-02-20T14:00:00Z' },
  { id: 'a79', sampleId: 's67', type: 'pcr', concentration: 2.91, viability: 93.2, purity: 1.92, ph: 7.5, temperature: -20, performedAt: '2026-04-14T10:00:00Z' },
  { id: 'a80', sampleId: 's67', type: 'flow-cytometry', concentration: 2.67, viability: 91.8, purity: 1.89, ph: 7.4, temperature: -20, performedAt: '2026-04-14T12:00:00Z' },
  { id: 'a81', sampleId: 's68', type: 'elisa', concentration: 2.34, viability: 83.5, purity: 1.79, ph: 7.3, temperature: -80, performedAt: '2026-04-18T12:00:00Z' },
  { id: 'a82', sampleId: 's69', type: 'sequencing', concentration: 2.12, viability: 85.7, purity: 1.82, ph: 7.3, temperature: -20, performedAt: '2026-04-19T10:00:00Z' },
  { id: 'a83', sampleId: 's69', type: 'microscopy', concentration: 1.98, viability: 83.4, purity: 1.79, ph: 7.2, temperature: -20, performedAt: '2026-04-19T12:00:00Z' },
  { id: 'a84', sampleId: 's71', type: 'pcr', concentration: 3.12, viability: 94.9, purity: 1.96, ph: 7.6, temperature: -20, performedAt: '2026-04-08T10:00:00Z' },
  { id: 'a85', sampleId: 's71', type: 'elisa', concentration: 2.89, viability: 93.5, purity: 1.93, ph: 7.5, temperature: -20, performedAt: '2026-04-08T12:00:00Z' },
  { id: 'a86', sampleId: 's72', type: 'flow-cytometry', concentration: 0.91, viability: 48.3, purity: 1.31, ph: 6.9, temperature: -80, performedAt: '2026-04-09T11:00:00Z', notes: 'Temperatura de armazenamento incorreta' },
  { id: 'a87', sampleId: 's73', type: 'pcr', concentration: 1.87, viability: 78.6, purity: 1.72, ph: 7.2, temperature: 4, performedAt: '2026-05-05T14:00:00Z' },
  { id: 'a88', sampleId: 's74', type: 'elisa', concentration: 3.21, viability: 95.7, purity: 1.97, ph: 7.6, temperature: -20, performedAt: '2026-04-07T10:00:00Z' },
  { id: 'a89', sampleId: 's74', type: 'sequencing', concentration: 2.98, viability: 94.3, purity: 1.95, ph: 7.5, temperature: -20, performedAt: '2026-04-07T12:00:00Z' },
  { id: 'a90', sampleId: 's74', type: 'microscopy', concentration: 2.76, viability: 93.1, purity: 1.92, ph: 7.4, temperature: -20, performedAt: '2026-04-07T14:00:00Z' },
  { id: 'a91', sampleId: 's76', type: 'pcr', concentration: 1.12, viability: 62.4, purity: 1.48, ph: 6.9, temperature: -20, performedAt: '2026-01-10T14:00:00Z' },
  { id: 'a92', sampleId: 's77', type: 'elisa', concentration: 2.78, viability: 90.6, purity: 1.88, ph: 7.4, temperature: -80, performedAt: '2026-04-06T10:00:00Z' },
  { id: 'a93', sampleId: 's77', type: 'flow-cytometry', concentration: 2.54, viability: 88.9, purity: 1.85, ph: 7.3, temperature: -80, performedAt: '2026-04-06T12:00:00Z' },
  { id: 'a94', sampleId: 's78', type: 'sequencing', concentration: 2.31, viability: 83.4, purity: 1.80, ph: 7.3, temperature: -80, performedAt: '2026-05-05T15:00:00Z' },
  { id: 'a95', sampleId: 's79', type: 'pcr', concentration: 3.05, viability: 95.1, purity: 1.96, ph: 7.6, temperature: -20, performedAt: '2026-04-05T10:00:00Z' },
  { id: 'a96', sampleId: 's79', type: 'microscopy', concentration: 2.81, viability: 93.7, purity: 1.93, ph: 7.5, temperature: -20, performedAt: '2026-04-05T12:00:00Z' },
]

export const MOCK_REPORTS: Report[] = [
  { id: 'r1', title: 'Relatório Mensal de Amostras - Abril 2026', type: 'Volumétrico', status: 'ready', sampleIds: ['s1', 's2', 's3', 's4', 's5'], generatedAt: '2026-05-01T10:00:00Z', format: 'pdf' },
  { id: 'r2', title: 'Análise de Viabilidade Q1 2026', type: 'Viabilidade', status: 'ready', sampleIds: ['s9', 's20', 's29'], generatedAt: '2026-04-15T14:00:00Z', format: 'xlsx' },
  { id: 'r3', title: 'Relatório de Falhas - Abril 2026', type: 'Qualidade', status: 'ready', sampleIds: ['s5', 's14', 's24', 's33'], generatedAt: '2026-05-02T09:00:00Z', format: 'pdf' },
  { id: 'r4', title: 'Concentração por Tipo de Análise', type: 'Analítico', status: 'ready', sampleIds: ['s1', 's4', 's7', 's10'], generatedAt: '2026-05-03T11:00:00Z', format: 'csv' },
  { id: 'r5', title: 'Dashboard Executivo - Semana 18', type: 'Executivo', status: 'draft', sampleIds: ['s39', 's42', 's45', 's47'], generatedAt: '2026-05-04T08:00:00Z', format: 'pdf' },
  { id: 'r6', title: 'Análise PCR - Lote 2026-04', type: 'PCR', status: 'ready', sampleIds: ['s1', 's4', 's10', 's15', 's19'], generatedAt: '2026-04-30T15:00:00Z', format: 'xlsx' },
  { id: 'r7', title: 'Relatório de Citometria de Fluxo', type: 'Citometria', status: 'ready', sampleIds: ['s7', 's12', 's22'], generatedAt: '2026-05-02T16:00:00Z', format: 'pdf' },
  { id: 'r8', title: 'Sequenciamento Genômico - Batch 3', type: 'Sequenciamento', status: 'generating', sampleIds: ['s4', 's10', 's15', 's25'], generatedAt: '2026-05-06T09:00:00Z', format: 'csv' },
  { id: 'r9', title: 'Controle de Qualidade Semanal', type: 'Qualidade', status: 'ready', sampleIds: ['s39', 's42', 's45', 's47', 's50'], generatedAt: '2026-05-05T17:00:00Z', format: 'pdf' },
  { id: 'r10', title: 'Relatório ELISA - Proteínas Marcadoras', type: 'ELISA', status: 'ready', sampleIds: ['s1', 's7', 's12', 's15'], generatedAt: '2026-05-04T14:00:00Z', format: 'xlsx' },
  { id: 'r11', title: 'Análise Comparativa Q1 vs Q2', type: 'Comparativo', status: 'draft', sampleIds: ['s1', 's4', 's7', 's10', 's15', 's19'], generatedAt: '2026-05-05T10:00:00Z', format: 'pdf' },
  { id: 'r12', title: 'Rastreabilidade de Amostras - Maio 2026', type: 'Rastreabilidade', status: 'generating', sampleIds: ['s30', 's35', 's38', 's41', 's46'], generatedAt: '2026-05-06T11:00:00Z', format: 'xlsx' },
  { id: 'r13', title: 'Análise de Microscopia Eletrônica', type: 'Microscopia', status: 'ready', sampleIds: ['s7', 's15', 's32', 's45'], generatedAt: '2026-05-03T15:00:00Z', format: 'pdf' },
  { id: 'r14', title: 'Relatório de Armazenamento e Temperatura', type: 'Logístico', status: 'archived', sampleIds: ['s9', 's20', 's29', 's58', 's65'], generatedAt: '2026-04-01T10:00:00Z', format: 'csv' },
  { id: 'r15', title: 'Análise de Pureza - LCR e Biópsias', type: 'Pureza', status: 'ready', sampleIds: ['s6', 's14', 's23', 's31', 's47'], generatedAt: '2026-05-05T13:00:00Z', format: 'xlsx' },
]

export const MONTHLY_SAMPLE_VOLUME = [
  { month: 'Jun/25', blood: 18, tissue: 8, urine: 6, saliva: 5, csf: 3, biopsy: 4 },
  { month: 'Jul/25', blood: 21, tissue: 9, urine: 7, saliva: 6, csf: 4, biopsy: 5 },
  { month: 'Ago/25', blood: 19, tissue: 7, urine: 8, saliva: 4, csf: 3, biopsy: 3 },
  { month: 'Set/25', blood: 24, tissue: 10, urine: 9, saliva: 7, csf: 5, biopsy: 6 },
  { month: 'Out/25', blood: 22, tissue: 11, urine: 7, saliva: 8, csf: 4, biopsy: 5 },
  { month: 'Nov/25', blood: 26, tissue: 12, urine: 10, saliva: 9, csf: 6, biopsy: 7 },
  { month: 'Dez/25', blood: 20, tissue: 9, urine: 8, saliva: 6, csf: 4, biopsy: 4 },
  { month: 'Jan/26', blood: 23, tissue: 10, urine: 9, saliva: 7, csf: 5, biopsy: 5 },
  { month: 'Fev/26', blood: 25, tissue: 11, urine: 10, saliva: 8, csf: 5, biopsy: 6 },
  { month: 'Mar/26', blood: 28, tissue: 13, urine: 11, saliva: 9, csf: 6, biopsy: 7 },
  { month: 'Abr/26', blood: 32, tissue: 15, urine: 12, saliva: 11, csf: 8, biopsy: 9 },
  { month: 'Mai/26', blood: 35, tissue: 16, urine: 13, saliva: 12, csf: 9, biopsy: 10 },
]

export const WEEKLY_ACTIVITY = [
  { day: 'Seg', samples: 12, analyses: 18, reports: 2 },
  { day: 'Ter', samples: 15, analyses: 22, reports: 3 },
  { day: 'Qua', samples: 11, analyses: 16, reports: 1 },
  { day: 'Qui', samples: 18, analyses: 27, reports: 4 },
  { day: 'Sex', samples: 14, analyses: 21, reports: 3 },
  { day: 'Sáb', samples: 6, analyses: 9, reports: 1 },
  { day: 'Dom', samples: 3, analyses: 4, reports: 0 },
]

export const VIABILITY_TREND = Array.from({ length: 30 }, (_, i) => {
  const date = new Date('2026-04-07')
  date.setDate(date.getDate() + i)
  const baseViability = 85 + Math.sin(i * 0.3) * 8 + (Math.random() - 0.5) * 6
  return {
    date: date.toISOString().split('T')[0],
    viability: Math.min(100, Math.max(50, parseFloat(baseViability.toFixed(1)))),
    threshold: 70,
  }
})

export function getSampleById(id: string): Sample | undefined {
  return MOCK_SAMPLES.find(s => s.id === id)
}

export function getAnalysesBySampleId(sampleId: string): Analysis[] {
  return MOCK_ANALYSES.filter(a => a.sampleId === sampleId)
}

export function getPatientById(id: string): Patient | undefined {
  return MOCK_PATIENTS.find(p => p.id === id)
}

export function getSamplesByPatientId(patientId: string): Sample[] {
  return MOCK_SAMPLES.filter(s => s.patientId === patientId)
}

export function getKPIs(): KPIMetric[] {
  const totalSamples = MOCK_SAMPLES.length
  const completedSamples = MOCK_SAMPLES.filter(s => s.status === 'completed').length
  const pendingSamples = MOCK_SAMPLES.filter(s => s.status === 'pending').length
  const avgViability = MOCK_ANALYSES.reduce((sum, a) => sum + a.viability, 0) / MOCK_ANALYSES.length
  const failedSamples = MOCK_SAMPLES.filter(s => s.status === 'failed').length

  return [
    { label: 'Total de Amostras', value: totalSamples, delta: 12.5, trend: 'up' },
    { label: 'Amostras Concluídas', value: completedSamples, unit: 'amostras', delta: 8.3, trend: 'up' },
    { label: 'Viabilidade Média', value: `${avgViability.toFixed(1)}%`, delta: 2.1, trend: 'up' },
    { label: 'Taxa de Falha', value: `${((failedSamples / totalSamples) * 100).toFixed(1)}%`, delta: -1.4, trend: 'down' },
  ]
}

export function getDashboardStats() {
  const pending = MOCK_SAMPLES.filter(s => s.status === 'pending').length
  const processing = MOCK_SAMPLES.filter(s => s.status === 'processing').length
  const completed = MOCK_SAMPLES.filter(s => s.status === 'completed').length
  const failed = MOCK_SAMPLES.filter(s => s.status === 'failed').length

  const lowViabilitySamples = MOCK_ANALYSES
    .filter(a => a.viability < 70)
    .map(a => MOCK_SAMPLES.find(s => s.id === a.sampleId))
    .filter(Boolean)

  return { pending, processing, completed, failed, lowViabilitySamples }
}
