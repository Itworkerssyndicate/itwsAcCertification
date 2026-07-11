import { Document, Page, Text, View, StyleSheet, Image, Font, Svg, Path, Rect } from '@react-pdf/renderer';
import { formatEgyptDate } from '../firebase/config';
import { getUnionLogoUrl, getUnionStampUrl } from '../cloudinary/upload';

// ============================================
// تسجيل الخطوط العربية
// ============================================
Font.register({
  family: 'Cairo',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/cairo/v22/SLXGc1nY6HkvalIhTp2mxdt0.woff2',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/cairo/v22/SLXGc1nY6HkvalIhTp2mxdt0.woff2',
      fontWeight: 'bold',
    },
  ],
});

// ============================================
// إنشاء أنماط PDF
// ============================================
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Cairo',
    direction: 'rtl',
  },
  container: {
    flex: 1,
    border: 2,
    borderColor: '#0055e6',
    borderRadius: 10,
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#0055e6',
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  stamp: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0055e6',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#00338a',
    textAlign: 'center',
    marginBottom: 20,
  },
  committeeName: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 25,
  },
  certificateTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0055e6',
    textAlign: 'center',
    marginVertical: 15,
    textDecoration: 'underline',
  },
  certificateCode: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  content: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
    paddingVertical: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00338a',
    width: 150,
    textAlign: 'right',
  },
  value: {
    fontSize: 14,
    color: '#1a1a2e',
    flex: 1,
    textAlign: 'right',
    paddingRight: 10,
  },
  signatureSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: 1,
    borderTopColor: '#cccccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signatureBox: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 3,
  },
  signatureLine: {
    width: 150,
    borderBottom: 1,
    borderBottomColor: '#333333',
    marginTop: 5,
  },
  signatureText: {
    fontSize: 10,
    color: '#333333',
    marginTop: 3,
  },
  footer: {
    marginTop: 30,
    borderTop: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
  },
  qrCode: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  qrLabel: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 5,
  },
  watermark: {
    position: 'absolute',
    fontSize: 60,
    color: 'rgba(0, 85, 230, 0.05)',
    textAlign: 'center',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-30deg)',
    fontWeight: 'bold',
  },
  borderDecoration: {
    border: 1,
    borderColor: '#0055e6',
    borderRadius: 5,
    padding: 8,
  },
  decorativeLine: {
    backgroundColor: '#0055e6',
    height: 2,
    width: 80,
    margin: 'auto',
    marginVertical: 10,
  },
});

// ============================================
// واجهة بيانات الشهادة
// ============================================
interface CertificateData {
  certificateCode: string;
  studentName: string;
  courseName: string;
  completionDate: Date;
  grade: string;
  academyName: string;
  academyLicenseNumber: string;
  committeeName?: string;
  unionName?: string;
}

// ============================================
// توليد PDF الشهادة
// ============================================
export const generateCertificatePDF = async (
  certificateData: CertificateData
): Promise<Buffer> => {
  const {
    certificateCode,
    studentName,
    courseName,
    completionDate,
    grade,
    academyName,
    academyLicenseNumber,
    committeeName = 'لجنة التحول الرقمي والتدريب',
    unionName = 'نقابة تكنولوجيا المعلومات والبرمجيات',
  } = certificateData;

  // الحصول على اللوجو والختم من Cloudinary
  const logoUrl = getUnionLogoUrl();
  const stampUrl = getUnionStampUrl();

  // تنسيق التاريخ
  const formattedDate = formatEgyptDate(completionDate);

  // إنشاء وثيقة PDF
  const CertificateDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* خلفية مائية */}
          <Text style={styles.watermark}>شهادة معتمدة</Text>

          {/* الرأس */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image src={logoUrl} style={styles.logo} />
            </View>
            <View style={styles.headerRight}>
              <Image src={stampUrl} style={styles.stamp} />
            </View>
          </View>

          {/* العنوان الرئيسي */}
          <Text style={styles.title}>{unionName}</Text>
          <Text style={styles.subtitle}>{committeeName}</Text>
          <View style={styles.decorativeLine} />

          {/* عنوان الشهادة */}
          <Text style={styles.certificateTitle}>شهادة اجتياز دورة تدريبية</Text>
          <Text style={styles.certificateCode}>كود الشهادة: {certificateCode}</Text>

          {/* محتوى الشهادة */}
          <View style={styles.content}>
            <View style={styles.textRow}>
              <Text style={styles.label}>اسم الطالب:</Text>
              <Text style={styles.value}>{studentName}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>اسم الدورة:</Text>
              <Text style={styles.value}>{courseName}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>تاريخ الاجتياز:</Text>
              <Text style={styles.value}>{formattedDate}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>التقدير:</Text>
              <Text style={styles.value}>{grade}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>الأكاديمية:</Text>
              <Text style={styles.value}>{academyName}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>رقم الاعتماد:</Text>
              <Text style={styles.value}>{academyLicenseNumber}</Text>
            </View>
          </View>

          {/* قسم التوقيعات */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>توقيع ممثل الأكاديمية</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>........................</Text>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>ختم الأكاديمية</Text>
              <View style={styles.signatureBox}>
                <Image src={stampUrl} style={{ width: 50, height: 50 }} />
              </View>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>توقيع رئيس اللجنة</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>د. أحمد محمد</Text>
            </View>
          </View>

          {/* التذييل */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>هذه الشهادة معتمدة من نقابة تكنولوجيا المعلومات والبرمجيات</Text>
            <Text style={styles.footerText}>يمكن التحقق من صحة الشهادة عبر المنصة الرسمية للنقابة</Text>
          </View>

          {/* رمز QR للتحقق */}
          <View style={styles.qrContainer}>
            <Text style={styles.qrLabel}>للتحقق من صحة الشهادة</Text>
            <View style={{ width: 80, height: 80, backgroundColor: '#f0f0f0', borderRadius: 5 }}>
              {/* هنا سيتم وضع رمز QR */}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );

  // تحويل الوثيقة إلى Buffer
  const pdfBuffer = await CertificateDocument();
  return pdfBuffer;
};

// ============================================
// توليد PDF تقرير
// ============================================
export const generateReportPDF = async (
  title: string,
  data: any[],
  columns: { key: string; label: string }[],
  generatedBy: string
): Promise<Buffer> => {
  // تنسيق التاريخ
  const now = formatEgyptDate(new Date());

  // إنشاء وثيقة تقرير PDF
  const ReportDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* الرأس */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image src={getUnionLogoUrl()} style={styles.logo} />
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.title}>نقابة تكنولوجيا المعلومات</Text>
              <Text style={styles.subtitle}>لجنة التحول الرقمي والتدريب</Text>
            </View>
          </View>

          <Text style={styles.certificateTitle}>{title}</Text>
          <Text style={styles.certificateCode}>تاريخ التقرير: {now}</Text>
          <Text style={styles.certificateCode}>تم إنشاؤه بواسطة: {generatedBy}</Text>

          <View style={styles.decorativeLine} />

          {/* جدول البيانات */}
          <View style={{ marginTop: 20 }}>
            {/* رأس الجدول */}
            <View style={{ flexDirection: 'row', backgroundColor: '#0055e6', padding: 8 }}>
              {columns.map((col) => (
                <Text key={col.key} style={{ flex: 1, color: 'white', fontWeight: 'bold', fontSize: 10, textAlign: 'center' }}>
                  {col.label}
                </Text>
              ))}
            </View>

            {/* صفوف الجدول */}
            {data.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', padding: 6, backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
                {columns.map((col) => (
                  <Text key={col.key} style={{ flex: 1, fontSize: 9, textAlign: 'center', padding: 4 }}>
                    {item[col.key] || '-'}
                  </Text>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© {new Date().getFullYear()} نقابة تكنولوجيا المعلومات والبرمجيات - جميع الحقوق محفوظة</Text>
          </View>
        </View>
      </Page>
    </Document>
  );

  const pdfBuffer = await ReportDocument();
  return pdfBuffer;
};

// ============================================
// توليد PDF بسيط
// ============================================
export const generateSimplePDF = async (
  content: string,
  title: string = 'وثيقة'
): Promise<Buffer> => {
  const SimpleDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <Text style={styles.certificateTitle}>{title}</Text>
          <View style={styles.decorativeLine} />
          <Text style={{ fontSize: 12, marginTop: 20, lineHeight: 1.5 }}>
            {content}
          </Text>
        </View>
      </Page>
    </Document>
  );

  const pdfBuffer = await SimpleDocument();
  return pdfBuffer;
};

// ============================================
// تصدير الدوال
// ============================================
export default {
  generateCertificatePDF,
  generateReportPDF,
  generateSimplePDF,
};
