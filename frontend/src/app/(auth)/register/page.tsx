"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ShoppingBag, Loader2, Eye, EyeOff } from "lucide-react";

// register
const schema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email"),
        phone: z.string().min(7, "Valid phone number required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(["buyer", "seller", "admin"]),
        address: z.string().optional(),
        adminCode: z.string().optional(),
    })
    .refine(
        (data) =>
            data.role !== "admin" ||
            (data.adminCode && data.adminCode.length > 0),
        { message: "Admin registration code is required", path: ["adminCode"] },
    );

type FormData = z.infer<typeof schema>;

const ROLE_DESCRIPTIONS = {
    buyer: "Browse and purchase verified items",
    seller: "List items for our admin to verify and sell",
    admin: "Platform administrator",
};

export default function RegisterPage() {
    const { register: authRegister } = useAuth();
    const router = useRouter();
    const [showPass, setShowPass] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { role: "buyer" },
    });

    const role = watch("role");

    const onSubmit = async (data: FormData) => {
        try {
            await authRegister(data);
            toast.success("Account created successfully!");
            router.push(
                data.role === "admin"
                    ? "/admin"
                    : data.role === "seller"
                      ? "/dashboard"
                      : "/",
            );
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900"
                    >
                        <ShoppingBag className="w-8 h-8 text-primary-600" />
                        Sell<span className="text-primary-600">It</span>
                    </Link>
                    <h2 className="text-xl font-semibold text-gray-900 mt-4">
                        Create an account
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Join SellIt and start buying or selling
                    </p>
                </div>

                <div className="card p-6">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {/* Role selector */}
                        <div>
                            <label className="label">I want to</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(["buyer", "seller"] as const).map((r) => (
                                    <label
                                        key={r}
                                        className={`relative cursor-pointer`}
                                    >
                                        <input
                                            {...register("role")}
                                            type="radio"
                                            value={r}
                                            className="sr-only"
                                        />
                                        <div
                                            className={`border-2 rounded-lg p-3 text-center transition ${role === r ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"}`}
                                        >
                                            <p className="font-medium text-sm capitalize">
                                                {r}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {ROLE_DESCRIPTIONS[r]}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="label">Full Name</label>
                            <input
                                {...register("name")}
                                className="input"
                                placeholder="John Doe"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="label">Email</label>
                            <input
                                {...register("email")}
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="label">Phone Number</label>
                            <input
                                {...register("phone")}
                                type="tel"
                                className="input"
                                placeholder="+234 800 000 0000"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>

                        {role === "seller" && (
                            <div>
                                <label className="label">
                                    Address{" "}
                                    <span className="text-gray-400 font-normal">
                                        – Helps admin find you
                                    </span>
                                </label>
                                <input
                                    {...register("address")}
                                    className="input"
                                    placeholder="e.g., 12 Allen Ave, Ikeja, Lagos"
                                />
                            </div>
                        )}

                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <input
                                    {...register("password")}
                                    type={showPass ? "text" : "password"}
                                    className="input pr-10"
                                    placeholder="Min. 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-2.5 text-gray-400"
                                >
                                    {showPass ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {role === "admin" && (
                            <div>
                                <label className="label">
                                    Admin Registration Code
                                </label>
                                <input
                                    {...register("adminCode")}
                                    className="input"
                                    placeholder="Enter admin code"
                                />
                                {errors.adminCode && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.adminCode.message}
                                    </p>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />{" "}
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-4">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-primary-600 font-medium hover:underline"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
