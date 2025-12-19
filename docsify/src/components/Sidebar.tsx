'use client';

import { Database } from '@/lib/database.types';
import Link from 'next/link';

type Space = Database['public']['Tables']['spaces']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

interface SidebarProps {
  spaces: Space[];
  currentSpace?: Space;
  pages?: Page[];
  currentPage?: Page;
}

export default function Sidebar({
  spaces,
  currentSpace,
  pages = [],
  currentPage,
}: SidebarProps) {
  const buildPageTree = (pages: Page[]) => {
    const rootPages = pages.filter((p) => !p.parent_id);
    return rootPages.sort((a, b) => a.order_index - b.order_index);
  };

  const pageTree = buildPageTree(pages);

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Spaces
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {spaces.map((space) => (
            <Link
              key={space.id}
              href={`/dashboard/spaces/${space.slug}`}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                currentSpace?.id === space.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {space.name}
            </Link>
          ))}
        </div>

        {currentSpace && (
          <>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Pages
                </h3>
                <Link
                  href={`/dashboard/spaces/${currentSpace.slug}/new`}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  + New
                </Link>
              </div>
            </div>

            <div className="p-2 space-y-1">
              {pageTree.map((page) => (
                <Link
                  key={page.id}
                  href={`/dashboard/spaces/${currentSpace.slug}/pages/${page.slug}`}
                  className={`block px-3 py-2 rounded-lg text-sm ${
                    currentPage?.id === page.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Link
          href="/dashboard/new-space"
          className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
        >
          + New Space
        </Link>
      </div>
    </div>
  );
}
