import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdOutlineCategory, 
  MdDragIndicator,
  MdSubdirectoryArrowRight
} from "react-icons/md";
import { adminCategoryApi } from "../../../api/admin.category.api.ts";

function AdminCategoryList() {
  const queryClient = useQueryClient();

  // 1. 카테고리 목록 조회 (GET /api/categories)
  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminCategoryApi.getCategoryTree(),
  });

  // 2. 카테고리 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminCategoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      alert("카테고리가 삭제되었습니다.");
    },
    onError: () => alert("카테고리 삭제 중 오류가 발생했습니다.")
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`[${name}] 카테고리를 삭제하시겠습니까?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 font-bold">카테고리 데이터를 불러오는 중...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#222222] tracking-tight">CATEGORY MANAGEMENT</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">메뉴 구조와 정렬 순서를 관리합니다.</p>
        </div>
        <Link
          to="/admin/categories/new"
          className="flex items-center gap-2 bg-[#222222] text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-black transition-all shadow-lg shadow-black/10"
        >
          <MdAdd size={20} />
          새 카테고리 등록
        </Link>
      </div>

      {/* Category List Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
            <MdOutlineCategory size={16} />
            Category Tree
          </div>
          <span className="text-[10px] font-bold text-gray-300 italic">Total: {categories?.length || 0} Root Categories</span>
        </div>

        <div className="divide-y divide-gray-50">
          {isError ? (
            <div className="p-20 text-center text-red-500 font-bold">데이터 로드 실패</div>
          ) : !categories || categories.length === 0 ? (
            <div className="p-20 text-center text-gray-400 font-bold">등록된 카테고리가 없습니다.</div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="group">
                {/* Parent Category */}
                <div className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <MdDragIndicator className="text-gray-300 cursor-move" size={20} />
                    <div className="w-10 h-10 rounded-xl bg-[#222222] text-[#FFD400] flex items-center justify-center font-black shadow-sm">
                      {category.sortOrder}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-[#222222]">{category.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        ID: {category.id} | Depth: {category.depth}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/admin/categories/${category.id}`}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-[#222222] transition-all"
                    >
                      <MdEdit size={20} />
                    </Link>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                </div>

                {/* Child Categories (Sub-menu) */}
                {category.categories && category.categories.length > 0 && (
                  <div className="bg-gray-50/30 pb-2">
                    {category.categories.map((sub) => (
                      // API 응답에 null이 섞여있을 경우를 대비한 방어 코드
                      sub && (
                        <div key={sub.id} className="flex items-center justify-between py-3 pl-16 pr-6 hover:bg-white transition-colors group/sub">
                          <div className="flex items-center gap-3">
                            <MdSubdirectoryArrowRight className="text-gray-300" />
                            <span className="text-sm font-bold text-gray-600">{sub.name}</span>
                            <span className="text-[10px] text-gray-300 font-medium">Order: {sub.sortOrder}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-sub/sub:opacity-100 transition-opacity">
                            <Link to={`/admin/categories/${sub.id}`} className="p-1.5 text-gray-400 hover:text-[#222222]"><MdEdit size={16} /></Link>
                            <button onClick={() => handleDelete(sub.id, sub.name)} className="p-1.5 text-gray-400 hover:text-red-500"><MdDelete size={16} /></button>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCategoryList;
