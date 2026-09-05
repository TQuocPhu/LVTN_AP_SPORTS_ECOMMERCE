# 🗄️ Quy Tắc Xử Lý Database Chuẩn ACID (Database ACID Rules for AI)

Mọi thao tác ghi/sửa dữ liệu Database trong dự án **BẮT BUỘC** phải tuân thủ nghiêm ngặt 4 thuộc tính **ACID**:

---

## ⚡ 1. Atomicity (Tính Nguyên Tố - Tất Cả Hoặc Không Cực Nào)

Mọi giao dịch (Transaction) chứa nhiều thao tác ghi/sửa phải được xem là một đơn vị công việc duy nhất: **Thành công tất cả hoặc Rollback toàn bộ**.

### Quy tắc áp dụng:
- Bắt buộc gắn `@Transactional(rollbackFor = Exception.class)` trên mọi Service method thực hiện thao tác ghi (`INSERT`, `UPDATE`, `DELETE`).
- **KHÔNG NÊN** dùng `@Transactional` mặc định mà không khai báo `rollbackFor`, vì mặc định Spring chỉ rollback với `RuntimeException`, bỏ qua `Checked Exception`.

```java
// ✅ ĐÚNG CHUẨN ATOMICITY
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void transferMoney(Long fromAccountId, Long toAccountId, BigDecimal amount) {
        Account from = accountRepository.findById(fromAccountId)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản gửi không tồn tại"));
        Account to = accountRepository.findById(toAccountId)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản nhận không tồn tại"));

        if (from.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Số dư không đủ để thực hiện giao dịch");
        }

        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));

        accountRepository.save(from);
        accountRepository.save(to);
        // Nếu xảy ra bất kỳ lỗi nào ở bước này, TOÀN BỘ số tiền của cả 2 tài khoản sẽ được hoàn lại như ban đầu.
    }
}
```

---

## 🔒 2. Consistency (Tính Nhất Quán)

Dữ liệu phải chuyển từ một trạng thái hợp lệ này sang một trạng thái hợp lệ khác. Không bao giờ được phép vi phạm các ràng buộc (Constraints) của Database.

### Quy tắc áp dụng:
- Định nghĩa rõ các ràng buộc `@Column(nullable = false)`, `@Column(unique = true)`, `@PositiveOrZero` ngay ở tầng JPA Entity.
- Kiểm tra các điều kiện tiên quyết (Business Invariants) trước khi lưu dữ liệu.

```java
@Entity
@Table(name = "accounts")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String accountNumber;

    @NotNull
    @DecimalMin(value = "0.0", message = "Số dư không được nhỏ hơn 0")
    @Column(nullable = false)
    private BigDecimal balance;
}
```

---

## 🛡️ 3. Isolation (Tính Cô Lập & Chống Race Condition)

Các giao dịch chạy đồng thời (Concurrent Transactions) không được can thiệp lẫn nhau hay làm sai lệch dữ liệu.

### Quy tắc áp dụng:
- Sử dụng **Optimistic Locking (Khóa lạc quan)** với thuộc tính `@Version` trong JPA Entity để ngăn chặn hiện tượng **Lost Update** khi 2 request cùng sửa 1 dòng dữ liệu cùng lúc.
- Với các giao dịch tài chính cực kỳ nhạy cảm, sử dụng **Pessimistic Locking (Khóa bi quan)** `@Lock(LockModeType.PESSIMISTIC_WRITE)`.

```java
@Entity
public class Account {
    // ... các trường khác

    @Version
    private Long version; // Tự động tăng phiên bản mỗi khi UPDATE. Nếu 2 transaction cùng sửa, Spring sẽ throw OptimisticLockException.
}
```

---

## 💾 4. Durability (Tính Bền Vững)

Sau khi Transaction báo thành công (Commit), dữ liệu **PHẢI** được ghi xuống đĩa cứng bền vững và không bị mất ngay cả khi hỏng điện hoặc sập server.

### Quy tắc áp dụng:
- Cấu hình JPA/Hibernate Flush policy đúng cách.
- Với Database sản xuất (PostgreSQL/MySQL), cấu hình ghi Log giao dịch (`WAL` - Write-Ahead Logging) an toàn.
