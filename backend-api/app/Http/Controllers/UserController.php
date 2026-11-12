<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => User::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $isSystemUser = in_array($request->role, ['admin', 'kasir']);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'no_telepon' => 'required|string|max:20',
            'role' => 'required|string|max:50',
            'gaji' => 'required|integer|min:0',
            'email' => $isSystemUser
                ? 'required|email|unique:users,email'
                : 'nullable|email|unique:users,email',
            'password' => $isSystemUser
                ? 'required|string|min:6'
                : 'nullable',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'no_telepon' => $validated['no_telepon'],
            'role' => $validated['role'],
            'gaji' => $validated['gaji'],
            'password' => $isSystemUser && !empty($validated['password'])
                ? Hash::make($validated['password'])
                : null,
        ]);

        return response()->json([
            'message' => 'Data karyawan berhasil ditambahkan',
            'data' => $user
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $isSystemUser = in_array($request->role, ['admin', 'kasir']);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'no_telepon' => 'required|string|max:20',
            'role' => 'required|string|max:50',
            'gaji' => 'required|integer|min:0',
            'email' => $isSystemUser
                ? 'required|email|unique:users,email,' . $user->id
                : 'nullable|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'no_telepon' => $validated['no_telepon'],
            'role' => $validated['role'],
            'gaji' => $validated['gaji'],
        ];

        // Jika bukan admin/kasir, hapus akses password-nya
        if (!$isSystemUser) {
            $data['password'] = null;
        } elseif (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Data karyawan berhasil diperbarui',
            'data' => $user
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'Tidak bisa menghapus akun yang sedang digunakan!'
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Data karyawan berhasil dihapus'
        ]);
    }
}