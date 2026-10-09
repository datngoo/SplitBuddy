# SplitBuddy

**Chia tiền, giữ niềm vui.** Ứng dụng web tiếng Việt để ghi chi phí nhóm và chốt sổ cho chuyến đi, bữa ăn hoặc sự kiện. Giao diện phù hợp iPhone và máy tính. Chạy trực tiếp trên GitHub Pages, không cần backend hay dịch vụ trả phí riêng.

Địa chỉ GitHub Pages sau khi triển khai: **https://datngoo.github.io/SplitBuddy/**

## Có gì trong bản này?

- Tạo, sửa, tìm kiếm, lưu trữ và xóa chuyến đi.
- Thêm, đổi tên và xóa thành viên chưa có khoản chi liên quan.
- Ghi, sửa, xóa khoản chi: số tiền, ngày, danh mục, người trả, những người tham gia, ghi chú.
- Người trả có thể không tham gia khoản chi. Mỗi hóa đơn được chia riêng.
- Bảng tổng tiền đã trả, phần phải chịu, số dư và danh sách chuyển tiền.
- Sao chép hoặc dùng menu chia sẻ của thiết bị để gửi tổng kết vào Zalo/Messenger.
- Lưu tự động trên trình duyệt. Xuất/nhập bản sao lưu JSON có kiểm tra dữ liệu và xác nhận trước khi thay thế.
- Biểu tượng màn hình chính, manifest và service worker để dùng ngoại tuyến sau khi tải bộ nhớ đệm thành công.
- Một chuyến đi mẫu được ghi rõ nhãn; không tính vào thống kê chi tiêu thật. Có thể xóa trong phần chỉnh sửa chuyến đi.

## Dùng trên iPhone

1. Mở địa chỉ ứng dụng bằng Safari.
2. Chọn **Chia sẻ → Thêm vào Màn hình chính**.
3. Mở SplitBuddy từ biểu tượng vừa thêm.
4. Tạo chuyến đi, nhập tên thành viên và bắt đầu ghi khoản chi.

Đây là web app/PWA, chưa phải ứng dụng iOS trên App Store. Menu cài đặt và chia sẻ phụ thuộc phiên bản trình duyệt. Đã kiểm tra bố cục điện thoại bằng Chrome với nhiều kích thước màn hình; chưa kiểm tra trên iPhone/Safari thật.

## Dữ liệu nằm ở đâu?

Dữ liệu nằm trong `localStorage` của trình duyệt đang dùng, tách theo đường dẫn ứng dụng. **Chia sẻ URL không chia sẻ dữ liệu chuyến đi**, và dữ liệu không tự đồng bộ giữa thiết bị/trình duyệt. Hãy dùng **Sao lưu → Xuất bản sao lưu**, sau đó nhập tệp trên thiết bị khác khi cần.

Xóa dữ liệu trình duyệt, sử dụng chế độ riêng tư, đổi địa chỉ website hoặc cơ chế dọn bộ nhớ của thiết bị có thể làm mất quyền truy cập bản dữ liệu hiện tại. Nên xuất sao lưu định kỳ. Đây là lưu trữ cục bộ, không phải mã hóa dữ liệu hay cơ chế đăng nhập.

Mã nguồn và các tài nguyên giao diện được GitHub Pages phục vụ công khai. Ứng dụng không gửi tên thành viên, khoản chi hoặc bản sao lưu lên GitHub hay máy chủ ứng dụng. Không dùng analytics, font hoặc ảnh từ bên thứ ba.

## Cách tính tiền

Số tiền được nhập bằng số nguyên đồng: `150000` hoặc `150.000`. Không nhận số thập phân hay ký hiệu `150k` để tránh hiểu sai.

1. Chia từng khoản cho người tham gia. Nếu chia không hết, phân bổ thêm 1đ theo thứ tự danh sách tham gia đã lưu. Tổng phần chia luôn bằng số tiền hóa đơn.
2. Số dư mỗi người = tổng đã trả − tổng phải chịu.
3. Với tối đa **16 người có số dư khác 0**, thuật toán phân hoạch tập con tổng bằng 0 tìm **số giao dịch ít nhất** (`O(n × 2ⁿ)`). Nhóm lớn hơn dùng cách ghép người nợ lớn nhất với người được nhận lớn nhất, bảo đảm cân bằng nhưng không hứa ít giao dịch nhất; giao diện ghi rõ trường hợp này.

Ví dụ 4 người An, Bình, Cường, Dũng:

| Khoản chi | Người trả | Người tham gia | Số tiền |
| --- | --- | --- | ---: |
| Phòng | An | Cả 4 người | 2.000.000đ |
| Ăn tối | Bình | Cả 4 người | 1.200.000đ |
| Taxi | Cường | An, Bình, Cường | 300.000đ |

Số dư đúng: **An +1.100.000đ, Bình +300.000đ, Cường −600.000đ, Dũng −800.000đ**. Có nhiều cách chuyển tương đương với 3 giao dịch. Tổng kết trong ứng dụng được tính từ dữ liệu, không dùng con số mẫu cố định.

Giới hạn: 200 chuyến đi; 100 thành viên/chuyến; 5.000 khoản chi/chuyến; tối đa 1.000.000.000.000đ/khoản; tệp nhập tối đa 10 MB. Dung lượng thực tế còn phụ thuộc hạn mức lưu trữ trình duyệt. Khi không thể lưu, ứng dụng báo lỗi thay vì thông báo đã lưu thành công.

## Chạy trên máy

Cần Node.js 20 trở lên. Không cần cài thư viện:

```sh
npm start
```

Mở địa chỉ mà chương trình in ra (mặc định `http://127.0.0.1:4173`). Đường dẫn `http://127.0.0.1:4173/SplitBuddy/` cũng được hỗ trợ để thử cấu trúc GitHub Pages.

```sh
npm run check
npm test
```

Bộ kiểm tra tự động bao gồm tính toán ví dụ, chia lẻ, người trả ngoài danh sách tham gia, chỉnh sửa dữ liệu, kiểm tra bản sao lưu và đối chiếu số giao dịch tối thiểu trên 150 bộ số dư với một thuật toán vét cạn độc lập.

## Triển khai lên GitHub Pages

Repository đã có `.github/workflows/pages.yml`. Trong **Settings → Pages → Build and deployment**, chọn **Source: GitHub Actions**. Mỗi lần push lên `main`, workflow sẽ kiểm tra mã, chạy test và triển khai riêng thư mục `docs/`.

Workflow tự gắn phiên bản bộ nhớ đệm ngoại tuyến theo commit. Sau lần triển khai mới, đóng tất cả tab/cửa sổ SplitBuddy rồi mở lại để phiên bản mới được kích hoạt; dữ liệu cục bộ được giữ lại.

Tài liệu chính thức: [Custom workflows for GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Nếu tự phục vụ trực tiếp thư mục `docs/` ở nơi khác, hãy tăng phiên bản `CACHE` trong `docs/sw.js` mỗi lần cập nhật giao diện. Không đổi địa chỉ website nếu chưa sao lưu dữ liệu.

## Cấu trúc mã nguồn

```text
docs/
  index.html             Trang vào, metadata và liên kết PWA
  app.js                 Giao diện, thao tác và lưu trữ
  logic.js               Chia tiền, chốt sổ, kiểm tra bản sao lưu
  styles.css             Giao diện responsive
  sw.js                  Bộ nhớ đệm ngoại tuyến
  manifest.webmanifest   Cài web app ra màn hình chính
  assets/                Minh họa và biểu tượng tự chứa
tests/logic.test.mjs      Kiểm tra tính toán và dữ liệu
scripts/serve.mjs         Máy chủ xem thử cục bộ
scripts/version-cache.mjs Phiên bản hóa cache khi triển khai
.github/workflows/pages.yml
```

Mã JavaScript thuần, CSS và SVG giúp bản đầu nhỏ, không có phụ thuộc chạy ứng dụng. Logic trong `logic.js` tách biệt với giao diện để có thể chuyển sang Swift/SwiftUI ở giai đoạn ứng dụng iOS.
