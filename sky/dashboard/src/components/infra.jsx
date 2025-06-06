/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/X5tLGA3WPNU
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { Layout } from '@/components/elements/layout';
import { RotateCwIcon, SearchIcon, XIcon } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import { getGPUs, getCloudInfrastructure } from '@/data/connectors/infra';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NonCapitalizedTooltip } from '@/components/utils';

// Set the refresh interval to 1 minute for GPU data
const GPU_REFRESH_INTERVAL = 60000;
const NAME_TRUNCATE_LENGTH = 30;

// Reusable component for infrastructure sections (SSH Node Pool or Kubernetes)
export function InfrastructureSection({
  title,
  isLoading,
  isDataLoaded,
  contexts,
  gpus,
  groupedPerContextGPUs,
  groupedPerNodeGPUs,
  handleContextClick,
  isSSH = false, // To differentiate between SSH and Kubernetes
}) {
  if (isLoading && !isDataLoaded) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="flex items-center justify-center py-6">
            <CircularProgress size={24} className="mr-3" />
            <span className="text-gray-500">Loading {title}...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isDataLoaded && contexts.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <p className="text-sm text-gray-500">No {title} found.</p>
        </div>
      </div>
    );
  }

  if (isDataLoaded && contexts.length > 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
        <div className="p-5">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {contexts.length}{' '}
              {contexts.length === 1
                ? isSSH
                  ? 'pool'
                  : 'context'
                : isSSH
                  ? 'pools'
                  : 'contexts'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left font-medium text-gray-600 w-1/3">
                        {isSSH ? 'Node Pool' : 'Context'}
                      </th>
                      <th className="p-3 text-left font-medium text-gray-600 w-1/6">
                        Nodes
                      </th>
                      <th className="p-3 text-left font-medium text-gray-600 w-1/3">
                        GPU Types
                      </th>
                      <th className="p-3 text-left font-medium text-gray-600 w-1/6">
                        #GPUs
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`bg-white divide-y divide-gray-200 ${contexts.length > 5 ? 'max-h-[250px] overflow-y-auto block' : ''}`}
                  >
                    {contexts.map((context) => {
                      const gpus = groupedPerContextGPUs[context] || [];
                      const nodes = groupedPerNodeGPUs[context] || [];
                      const totalGpus = gpus.reduce(
                        (sum, gpu) => sum + (gpu.gpu_total || 0),
                        0
                      );

                      // Format GPU types based on context type
                      const gpuTypes = (() => {
                        const typeCounts = gpus.reduce((acc, gpu) => {
                          acc[gpu.gpu_name] =
                            (acc[gpu.gpu_name] || 0) + (gpu.gpu_total || 0);
                          return acc;
                        }, {});

                        return Object.keys(typeCounts).join(', ');
                      })();

                      // Format display name for SSH contexts
                      const displayName = isSSH
                        ? context.replace(/^ssh-/, '')
                        : context;

                      return (
                        <tr key={context} className="hover:bg-gray-50">
                          <td className="p-3">
                            <NonCapitalizedTooltip
                              content={displayName}
                              className="text-sm text-muted-foreground"
                            >
                              <span
                                className="text-blue-600 hover:underline cursor-pointer"
                                onClick={() => handleContextClick(context)}
                              >
                                {displayName.length > NAME_TRUNCATE_LENGTH
                                  ? `${displayName.substring(0, Math.floor((NAME_TRUNCATE_LENGTH - 3) / 2))}...${displayName.substring(displayName.length - Math.ceil((NAME_TRUNCATE_LENGTH - 3) / 2))}`
                                  : displayName}
                              </span>
                            </NonCapitalizedTooltip>
                          </td>
                          <td className="p-3">{nodes.length}</td>
                          <td className="p-3">{gpuTypes || '-'}</td>
                          <td className="p-3">{totalGpus}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {gpus.length > 0 && (
              <div>
                <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left font-medium text-gray-600 w-1/4 whitespace-nowrap">
                          GPU
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium whitespace-nowrap">
                            {gpus.reduce((sum, gpu) => sum + gpu.gpu_free, 0)}{' '}
                            of{' '}
                            {gpus.reduce((sum, gpu) => sum + gpu.gpu_total, 0)}{' '}
                            free
                          </span>
                        </th>
                        <th className="p-3 text-left font-medium text-gray-600 w-1/4">
                          Requestable
                        </th>
                        <th className="p-3 text-left font-medium text-gray-600 w-1/2">
                          <div className="flex items-center">
                            <span>Utilization</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`bg-white divide-y divide-gray-200 ${gpus.length > 5 ? 'max-h-[250px] overflow-y-auto block' : ''}`}
                    >
                      {gpus.map((gpu) => {
                        const usedGpus = gpu.gpu_total - gpu.gpu_free;
                        const freePercentage =
                          gpu.gpu_total > 0
                            ? (gpu.gpu_free / gpu.gpu_total) * 100
                            : 0;
                        const usedPercentage =
                          gpu.gpu_total > 0
                            ? (usedGpus / gpu.gpu_total) * 100
                            : 0;

                        // Find the requestable quantities from contexts
                        const requestableQtys = groupedPerContextGPUs
                          ? Object.values(groupedPerContextGPUs)
                              .flat()
                              .filter(
                                (g) =>
                                  g.gpu_name === gpu.gpu_name &&
                                  (isSSH
                                    ? g.context.startsWith('ssh-')
                                    : !g.context.startsWith('ssh-'))
                              )
                              .map((g) => g.gpu_requestable_qty_per_node)
                              .filter((qty, i, arr) => arr.indexOf(qty) === i) // Unique values
                              .join(', ')
                          : '-';

                        return (
                          <tr key={gpu.gpu_name}>
                            <td className="p-3 font-medium w-24 whitespace-nowrap">
                              {gpu.gpu_name}
                            </td>
                            <td className="p-3 text-xs text-gray-600">
                              {requestableQtys || '-'} / node
                            </td>
                            <td className="p-3 w-2/3">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-100 rounded-md h-5 flex overflow-hidden shadow-sm min-w-[100px] w-full">
                                  {usedPercentage > 0 && (
                                    <div
                                      style={{ width: `${usedPercentage}%` }}
                                      className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs font-medium"
                                    >
                                      {usedPercentage > 15 &&
                                        `${usedGpus} used`}
                                    </div>
                                  )}
                                  {freePercentage > 0 && (
                                    <div
                                      style={{ width: `${freePercentage}%` }}
                                      className="bg-green-700 h-full flex items-center justify-center text-white text-xs font-medium"
                                    >
                                      {freePercentage > 15 &&
                                        `${gpu.gpu_free} free`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Reusable component for context details
export function ContextDetails({ contextName, gpusInContext, nodesInContext }) {
  // Determine if this is an SSH context
  const isSSHContext = contextName.startsWith('ssh-');
  const displayTitle = isSSHContext ? 'Node Pool' : 'Context';

  return (
    <div className="mb-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full">
        <div className="p-5">
          <h4 className="text-lg font-semibold mb-4">Available GPUs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {gpusInContext.map((gpu) => {
              const usedGpus = gpu.gpu_total - gpu.gpu_free;
              const freePercentage =
                gpu.gpu_total > 0 ? (gpu.gpu_free / gpu.gpu_total) * 100 : 0;
              const usedPercentage =
                gpu.gpu_total > 0 ? (usedGpus / gpu.gpu_total) * 100 : 0;

              return (
                <div
                  key={gpu.gpu_name}
                  className="p-3 bg-gray-50 rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-1.5 flex-wrap">
                    <div className="font-medium text-gray-800 text-sm">
                      {gpu.gpu_name}
                      <span className="text-xs text-gray-500 ml-2">
                        (Requestable: {gpu.gpu_requestable_qty_per_node} / node)
                      </span>
                    </div>
                    <span className="text-xs font-medium">
                      {gpu.gpu_free} free / {gpu.gpu_total} total
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-md h-4 flex overflow-hidden shadow-sm">
                    {usedPercentage > 0 && (
                      <div
                        style={{ width: `${usedPercentage}%` }}
                        className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs"
                      >
                        {usedPercentage > 15 && `${usedGpus} used`}
                      </div>
                    )}
                    {freePercentage > 0 && (
                      <div
                        style={{ width: `${freePercentage}%` }}
                        className="bg-green-700 h-full flex items-center justify-center text-white text-xs"
                      >
                        {freePercentage > 15 && `${gpu.gpu_free} free`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {nodesInContext.length > 0 && (
            <>
              <h4 className="text-lg font-semibold mb-4">Nodes</h4>
              <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left font-medium text-gray-600">
                        Node
                      </th>
                      <th className="p-3 text-left font-medium text-gray-600">
                        GPU
                      </th>
                      <th className="p-3 text-right font-medium text-gray-600">
                        Availability
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {nodesInContext.map((node, index) => (
                      <tr
                        key={`${node.node_name}-${index}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="p-3 whitespace-nowrap text-gray-700">
                          {node.node_name}
                        </td>
                        <td className="p-3 whitespace-nowrap text-gray-700">
                          {node.gpu_name}
                        </td>
                        <td className="p-3 whitespace-nowrap text-right text-gray-700">
                          {`${node.gpu_free} of ${node.gpu_total} free`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function GPUs() {
  // Separate loading states for different data sources
  const [kubeLoading, setKubeLoading] = useState(true);
  const [cloudLoading, setCloudLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const refreshDataRef = React.useRef(null);
  const isMobile = useMobile();
  const [kubeDataLoaded, setKubeDataLoaded] = useState(false);
  const [cloudDataLoaded, setCloudDataLoaded] = useState(false);
  const router = useRouter();

  const [allKubeContextNames, setAllKubeContextNames] = useState([]);
  const [allGPUs, setAllGPUs] = useState([]);
  const [perContextGPUs, setPerContextGPUs] = useState([]);
  const [perNodeGPUs, setPerNodeGPUs] = useState([]);
  const [cloudInfraData, setCloudInfraData] = useState([]);
  const [totalClouds, setTotalClouds] = useState(0);
  const [enabledClouds, setEnabledClouds] = useState(0);

  // Selected context for subpage view
  const [selectedContext, setSelectedContext] = useState(null);

  const fetchData = React.useCallback(async () => {
    // Start loading for both data sources
    setKubeLoading(true);
    setCloudLoading(true);

    // Fetch Kubernetes data
    try {
      const gpusResponse = await getGPUs();
      const {
        allContextNames: fetchedAllKubeContextNames,
        allGPUs: fetchedAllGPUs,
        perContextGPUs: fetchedPerContextGPUs,
        perNodeGPUs: fetchedPerNodeGPUs,
      } = gpusResponse;

      setAllKubeContextNames(fetchedAllKubeContextNames || []);
      setAllGPUs(fetchedAllGPUs || []);
      setPerContextGPUs(fetchedPerContextGPUs || []);
      setPerNodeGPUs(fetchedPerNodeGPUs || []);
      setKubeDataLoaded(true);
    } catch (err) {
      console.error('Error fetching Kubernetes data:', err);
      setAllKubeContextNames([]);
      setAllGPUs([]);
      setPerContextGPUs([]);
      setPerNodeGPUs([]);
    } finally {
      setKubeLoading(false);
    }

    // Fetch Cloud infrastructure data
    try {
      const cloudInfraResponse = await getCloudInfrastructure();
      setCloudInfraData(cloudInfraResponse?.clouds || []);
      setTotalClouds(cloudInfraResponse?.totalClouds || 0);
      setEnabledClouds(cloudInfraResponse?.enabledClouds || 0);
      setCloudDataLoaded(true);
    } catch (err) {
      console.error('Error fetching cloud infrastructure data:', err);
      setCloudInfraData([]);
      setTotalClouds(0);
      setEnabledClouds(0);
    } finally {
      setCloudLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  React.useEffect(() => {
    if (refreshDataRef) {
      refreshDataRef.current = fetchData;
    }
  }, [refreshDataRef, fetchData]);

  useEffect(() => {
    let isCurrent = true;

    fetchData();

    const interval = setInterval(() => {
      if (isCurrent) {
        fetchData();
      }
    }, GPU_REFRESH_INTERVAL);

    return () => {
      isCurrent = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  const handleRefresh = () => {
    if (refreshDataRef.current) {
      setIsInitialLoad(false);
      refreshDataRef.current();
    }
  };

  // Calculate summary data
  const totalGpuTypes = allGPUs.length;
  const grandTotalGPUs = allGPUs.reduce((sum, gpu) => sum + gpu.gpu_total, 0);
  const grandTotalFreeGPUs = allGPUs.reduce(
    (sum, gpu) => sum + gpu.gpu_free,
    0
  );

  // Group perContextGPUs by context (already flattened from the backend)
  const groupedPerContextGPUs = React.useMemo(() => {
    if (!perContextGPUs) return {};
    return perContextGPUs.reduce((acc, gpu) => {
      const { context } = gpu;
      if (!acc[context]) {
        acc[context] = [];
      }
      acc[context].push(gpu);
      return acc;
    }, {});
  }, [perContextGPUs]);

  // Separate SSH contexts from Kubernetes contexts using allKubeContextNames
  const sshContexts = React.useMemo(() => {
    const contexts = allKubeContextNames.filter((context) =>
      context.startsWith('ssh-')
    );
    return contexts;
  }, [allKubeContextNames]);

  const kubeContexts = React.useMemo(() => {
    const contexts = allKubeContextNames.filter(
      (context) => !context.startsWith('ssh-')
    );
    return contexts;
  }, [allKubeContextNames]);

  // Filter GPUs by context type (SSH vs Kubernetes)
  const sshGPUs = React.useMemo(() => {
    if (!perContextGPUs) return [];

    // Create a map of GPU names from SSH contexts
    const sshGpuNames = new Set();
    perContextGPUs.forEach((gpu) => {
      if (gpu.context.startsWith('ssh-')) {
        sshGpuNames.add(gpu.gpu_name);
      }
    });

    // Filter allGPUs based on whether they appear in SSH contexts
    return allGPUs.filter((gpu) => sshGpuNames.has(gpu.gpu_name));
  }, [allGPUs, perContextGPUs]);

  const kubeGPUs = React.useMemo(() => {
    if (!perContextGPUs) return [];

    // Create a map of GPU names from Kubernetes contexts
    const kubeGpuNames = new Set();
    perContextGPUs.forEach((gpu) => {
      if (!gpu.context.startsWith('ssh-')) {
        kubeGpuNames.add(gpu.gpu_name);
      }
    });

    // Filter allGPUs based on whether they appear in Kubernetes contexts
    return allGPUs.filter((gpu) => kubeGpuNames.has(gpu.gpu_name));
  }, [allGPUs, perContextGPUs]);

  // Group perNodeGPUs by context
  const groupedPerNodeGPUs = React.useMemo(() => {
    if (!perNodeGPUs) return {};
    return perNodeGPUs.reduce((acc, node) => {
      const { context } = node;
      if (!acc[context]) {
        acc[context] = [];
      }
      acc[context].push(node);
      return acc;
    }, {});
  }, [perNodeGPUs]);

  // Check URL on component mount to set initial context
  useEffect(() => {
    if (router.query.context) {
      const contextParam = Array.isArray(router.query.context)
        ? router.query.context[0]
        : router.query.context;
      setSelectedContext(decodeURIComponent(contextParam));
    }
  }, [router.isReady, router.query]);

  // Handler for clicking on a context
  const handleContextClick = (context) => {
    setSelectedContext(context);
    // Use replace instead of push and set as to the same URL to ensure it's just a URL change
    router.replace(
      {
        pathname: '/infra',
        query: context ? { context } : undefined,
      },
      context ? `/infra/${encodeURIComponent(context)}` : '/infra',
      { shallow: true }
    );
  };

  // Handler to go back to main view
  const handleBackClick = () => {
    setSelectedContext(null);
    // Use replace and set as to the same URL
    router.replace({ pathname: '/infra' }, '/infra', { shallow: true });
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleRouteChange = (url) => {
      const contextMatch = url.match(/\/infra\/([^\/]+)$/);
      if (contextMatch) {
        const contextParam = decodeURIComponent(contextMatch[1]);
        setSelectedContext(contextParam);
      } else if (url === '/infra') {
        setSelectedContext(null);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Render context details
  const renderContextDetails = (contextName) => {
    const gpusInContext = groupedPerContextGPUs[contextName] || [];
    const nodesInContext = groupedPerNodeGPUs[contextName] || [];

    if (kubeLoading && !kubeDataLoaded) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <CircularProgress size={32} className="mb-4" />
          <span className="text-gray-500 text-lg">Loading Context...</span>
        </div>
      );
    }

    return (
      <ContextDetails
        contextName={contextName}
        gpusInContext={gpusInContext}
        nodesInContext={nodesInContext}
      />
    );
  };

  const renderCloudInfrastructure = () => {
    if (cloudLoading && !cloudDataLoaded) {
      return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
          <div className="p-5">
            <h3 className="text-lg font-semibold mb-4">Cloud</h3>
            <div className="flex items-center justify-center py-6">
              <CircularProgress size={24} className="mr-3" />
              <span className="text-gray-500">Loading Cloud...</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
        <div className="p-5">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold">Cloud</h3>
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {enabledClouds} of {totalClouds} enabled
            </span>
          </div>
          {cloudInfraData.length === 0 ? (
            <p className="text-sm text-gray-500">
              No enabled clouds available.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left font-medium text-gray-600 w-32">
                      Cloud
                    </th>
                    <th className="p-3 text-left font-medium text-gray-600 w-24">
                      Clusters
                    </th>
                    <th className="p-3 text-left font-medium text-gray-600 w-24">
                      Jobs
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cloudInfraData.map((cloud) => (
                    <tr key={cloud.name} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-700">
                        {cloud.name}
                      </td>
                      <td className="p-3">
                        {cloud.clusters > 0 ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {cloud.clusters}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">
                            0
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {cloud.jobs > 0 ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                            {cloud.jobs}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">
                            0
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderKubernetesInfrastructure = () => {
    return (
      <InfrastructureSection
        title="Kubernetes"
        isLoading={kubeLoading}
        isDataLoaded={kubeDataLoaded}
        contexts={kubeContexts}
        gpus={kubeGPUs}
        groupedPerContextGPUs={groupedPerContextGPUs}
        groupedPerNodeGPUs={groupedPerNodeGPUs}
        handleContextClick={handleContextClick}
        isSSH={false}
      />
    );
  };

  const renderSSHNodePoolInfrastructure = () => {
    return (
      <InfrastructureSection
        title="SSH Node Pool"
        isLoading={kubeLoading}
        isDataLoaded={kubeDataLoaded}
        contexts={sshContexts}
        gpus={sshGPUs}
        groupedPerContextGPUs={groupedPerContextGPUs}
        groupedPerNodeGPUs={groupedPerNodeGPUs}
        handleContextClick={handleContextClick}
        isSSH={true}
      />
    );
  };

  const renderKubernetesTab = () => {
    // If a context is selected, show its details instead of the summary
    if (selectedContext) {
      if (kubeLoading && !kubeDataLoaded) {
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <CircularProgress size={32} className="mb-4" />
            <span className="text-gray-500 text-lg">Loading Context...</span>
          </div>
        );
      }
      return renderContextDetails(selectedContext);
    }

    return (
      <>
        {/* Show SSH Node Pool Infrastructure first */}
        {renderSSHNodePoolInfrastructure()}

        {/* Show Kubernetes Infrastructure second */}
        {renderKubernetesInfrastructure()}

        {/* Then show Cloud Infrastructure */}
        {renderCloudInfrastructure()}
      </>
    );
  };

  // Check if any data is currently loading
  const isAnyLoading = kubeLoading || cloudLoading;

  return (
    <Layout highlighted="infra">
      <div className="flex items-center justify-between mb-4 h-5">
        <div className="text-base flex items-center">
          <Link
            href="/infra"
            className={`text-sky-blue hover:underline ${selectedContext ? '' : 'cursor-default'}`}
            onClick={(e) => {
              if (selectedContext) {
                e.preventDefault();
                handleBackClick();
              }
            }}
          >
            Infrastructure
          </Link>
          {selectedContext && (
            <>
              <span className="mx-2 text-gray-500">›</span>
              {selectedContext.startsWith('ssh-') ? (
                <span
                  className="text-sky-blue hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleBackClick();
                  }}
                >
                  SSH Node Pool
                </span>
              ) : (
                <span
                  className="text-sky-blue hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleBackClick();
                  }}
                >
                  Kubernetes
                </span>
              )}
              <span className="mx-2 text-gray-500">›</span>
              <span className="text-sky-blue">
                {selectedContext.startsWith('ssh-')
                  ? selectedContext.replace(/^ssh-/, '')
                  : selectedContext}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center">
          {isAnyLoading && (
            <div className="flex items-center mr-2">
              <CircularProgress size={15} className="mt-0" />
              <span className="ml-2 text-gray-500">Loading...</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={isAnyLoading}
            className="text-sky-blue hover:text-sky-blue-bright flex items-center"
          >
            <RotateCwIcon className="h-4 w-4 mr-1.5" />
            {!isMobile && 'Refresh'}
          </button>
        </div>
      </div>

      {renderKubernetesTab()}
    </Layout>
  );
}

// Helper table component for cloud GPUs
function CloudGpuTable({ data, title }) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  if (!data || data.length === 0) {
    return (
      <>
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <p className="text-sm text-gray-500">
          No GPUs found for this category.
        </p>
      </>
    );
  }

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);
  const paginatedData = data.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };
  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  return (
    <>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-b border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left font-medium text-gray-600">GPU</th>
              <th className="p-2 text-left font-medium text-gray-600">
                Available Quantities / Node
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((gpu, idx) => (
              <tr key={`${gpu.gpu_name}-${idx}`}>
                <td className="p-2 whitespace-nowrap text-gray-700">
                  {gpu.gpu_name}
                </td>
                <td className="p-2 whitespace-nowrap text-gray-700">
                  {gpu.gpu_quantities}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination controls */}
      {data.length > pageSize && (
        <div className="flex justify-end items-center py-2 px-4 text-sm text-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2">Rows per page:</span>
              <div className="relative inline-block">
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="py-1 pl-2 pr-6 appearance-none outline-none cursor-pointer border-none bg-transparent"
                  style={{ minWidth: '40px' }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-500 absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <div>
              {startIndex + 1} – {endIndex} of {data.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
