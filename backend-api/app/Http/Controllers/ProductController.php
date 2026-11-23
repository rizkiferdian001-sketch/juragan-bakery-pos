<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    private function formatProduct($product)
    {
        return [
            'id' => $product->id,
            'nama_produk' => $product->nama_produk,
            'kategori' => $product->kategori,
            'harga' => $product->harga,
            'stok' => $product->stok,
            'gambar' => $product->gambar,
            'gambar_url' => $product->gambar ? asset('storage/' . $product->gambar) : null,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ];
    }

    public function index()
    {
        $products = Product::latest()->get()->map(function ($product) {
            return $this->formatProduct($product);
        });

        return response()->json([
            'data' => $products
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'kategori' => 'required|string|max:100',
            'harga' => 'required|integer|min:0',
            'stok' => 'required|integer|min:0',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = $request->file('gambar')->store('products', 'public');
        }

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Produk berhasil ditambahkan',
            'data' => $this->formatProduct($product)
        ], 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'kategori' => 'required|string|max:100',
            'harga' => 'required|integer|min:0',
            'stok' => 'required|integer|min:0',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('gambar')) {
            if ($product->gambar) {
                Storage::disk('public')->delete($product->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('products', 'public');
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Produk berhasil diperbarui',
            'data' => $this->formatProduct($product)
        ]);
    }

    public function restock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'jumlah' => 'required|integer|min:1',
        ]);

        $product->increment('stok', $validated['jumlah']);

        return response()->json([
            'message' => "Stok {$product->nama_produk} berhasil ditambah {$validated['jumlah']} pcs",
            'data' => $this->formatProduct($product->fresh())
        ]);
    }

    public function destroy(Product $product)
    {
        if ($product->gambar) {
            Storage::disk('public')->delete($product->gambar);
        }

        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus'
        ]);
    }
}