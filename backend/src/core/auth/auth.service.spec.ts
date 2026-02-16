import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { UnauthorizedException, InternalServerErrorException } from "@nestjs/common";

// Mock dependencies
const mockFirebaseService = {
  auth: {
    verifyIdToken: jest.fn(),
  },
};

const mockPrismaService = {
  user: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    mockFirebaseService.auth.verifyIdToken.mockReset();
    mockPrismaService.user.upsert.mockReset();
    mockPrismaService.user.findUnique.mockReset();

    authService = new AuthService(
      mockFirebaseService as any,
      mockPrismaService as any
    );
  });

  // --- Happy Paths ---

  it("should register a new user via upsert (idempotent)", async () => {
    const dto: RegisterDto = { firebaseToken: "valid-token", email: "test@example.com" };
    const decodedToken = { uid: "user-123", email: "test@example.com" };
    const newUser = { id: "uuid-1", firebaseUid: "user-123", email: "test@example.com", role: "FREE" };

    mockFirebaseService.auth.verifyIdToken.mockResolvedValue(decodedToken);
    mockPrismaService.user.upsert.mockResolvedValue(newUser);

    const result = await authService.register(dto);

    expect(mockFirebaseService.auth.verifyIdToken).toHaveBeenCalledWith("valid-token");
    expect(mockPrismaService.user.upsert).toHaveBeenCalled();
    expect(result).toEqual(newUser);
    expect(result.role).toBe("FREE");
  });

  it("should return existing user on duplicate registration (idempotent)", async () => {
    const dto: RegisterDto = { firebaseToken: "valid-token" };
    const decodedToken = { uid: "user-123", email: "existing@example.com" };
    const existingUser = { id: "uuid-1", firebaseUid: "user-123", email: "existing@example.com", role: "FREE" };

    mockFirebaseService.auth.verifyIdToken.mockResolvedValue(decodedToken);
    mockPrismaService.user.upsert.mockResolvedValue(existingUser);

    const result = await authService.register(dto);

    expect(mockPrismaService.user.upsert).toHaveBeenCalled();
    expect(result).toEqual(existingUser);
  });

  // --- Error Paths (Discriminated) ---

  it("should throw UnauthorizedException on invalid Firebase token", async () => {
    const dto: RegisterDto = { firebaseToken: "bad-token" };
    mockFirebaseService.auth.verifyIdToken.mockRejectedValue(new Error("Token expired"));

    expect(authService.register(dto)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw InternalServerErrorException on database failure", async () => {
    const dto: RegisterDto = { firebaseToken: "valid-token" };
    const decodedToken = { uid: "user-123", email: "test@example.com" };

    mockFirebaseService.auth.verifyIdToken.mockResolvedValue(decodedToken);
    mockPrismaService.user.upsert.mockRejectedValue(new Error("DB connection lost"));

    expect(authService.register(dto)).rejects.toThrow(InternalServerErrorException);
  });

  // --- Edge Cases ---

  it("should use fallback email when Firebase token has no email", async () => {
    const dto: RegisterDto = { firebaseToken: "valid-token" };
    const decodedToken = { uid: "anon-uid-456" }; // No email in token

    mockFirebaseService.auth.verifyIdToken.mockResolvedValue(decodedToken);
    mockPrismaService.user.upsert.mockImplementation(async (args: any) => ({
      id: "uuid-2",
      firebaseUid: "anon-uid-456",
      email: args.create.email,
      role: "FREE",
    }));

    const result = await authService.register(dto);

    expect(result.email).toBe("anon-anon-uid-456@phylactery.ai");
  });
});
