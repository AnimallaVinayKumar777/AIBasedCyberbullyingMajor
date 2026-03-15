import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAICyberbullyingDetection, useRealTimeDetection } from '@/hooks/useAICyberbullyingDetection';
import { Brain, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export const AIDetectionDashboard: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [detectionMode, setDetectionMode] = useState<'manual' | 'realtime'>('manual');

  const manualDetection = useAICyberbullyingDetection({
    enableAI: true,
    enableRuleBased: true,
    sensitivity: 'medium'
  });

  const realtimeDetection = useRealTimeDetection(inputText, {
    enableAI: true,
    enableRuleBased: true,
    sensitivity: 'medium'
  });

  const currentDetection = detectionMode === 'manual' ? manualDetection : realtimeDetection;

  const handleAnalyze = async () => {
    if (inputText.trim()) {
      await manualDetection.detectContent(inputText);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Cyberbullying Detection Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={detectionMode} onValueChange={(value) => setDetectionMode(value as 'manual' | 'realtime')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Analysis</TabsTrigger>
              <TabsTrigger value="realtime">Real-time Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Content to Analyze</label>
                <Textarea
                  placeholder="Enter text to analyze for cyberbullying..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || manualDetection.isLoading}
                className="w-full"
              >
                {manualDetection.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Content
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="realtime" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Real-time monitoring analyzes content as you type. Results update automatically.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium">Live Content Monitoring</label>
                <Textarea
                  placeholder="Start typing to see real-time analysis..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Detection Results */}
          {currentDetection.result && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getSeverityIcon(currentDetection.result.severity)}
                  Detection Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={currentDetection.result.isCyberbullying ? "destructive" : "outline"}>
                        {currentDetection.result.isCyberbullying ? "Cyberbullying Detected" : "Safe Content"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Severity</span>
                      <Badge variant={getSeverityColor(currentDetection.result.severity)}>
                        {getSeverityIcon(currentDetection.result.severity)}
                        {currentDetection.result.severity.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Confidence</span>
                        <span className="text-sm">{(currentDetection.result.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={currentDetection.result.confidence * 100} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Confidence</span>
                      <span className="text-sm">{(currentDetection.result.aiConfidence * 100).toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rule-based Score</span>
                      <span className="text-sm">{(currentDetection.result.ruleBasedScore * 100).toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Context Score</span>
                      <span className="text-sm">{(currentDetection.result.contextScore * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {currentDetection.result.categories.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Categories Detected:</span>
                    <div className="flex flex-wrap gap-2">
                      {currentDetection.result.categories.map((category, index) => (
                        <Badge key={index} variant="outline">
                          {category.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Analysis powered by AI and rule-based detection systems
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {currentDetection.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{currentDetection.error}</AlertDescription>
            </Alert>
          )}

          {/* Model Status */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${currentDetection.isModelReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>
                AI Model: {currentDetection.isModelReady ? 'Ready' : 'Loading...'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Detection Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {currentDetection.isModelReady ? '✓' : '○'}
              </div>
              <div className="text-sm text-muted-foreground">AI Model</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {currentDetection.result?.isCyberbullying === false ? '✓' : '○'}
              </div>
              <div className="text-sm text-muted-foreground">Safe Content</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {currentDetection.result?.severity === 'medium' ? '!' : '○'}
              </div>
              <div className="text-sm text-muted-foreground">Medium Risk</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {currentDetection.result?.severity === 'high' ? '⚠' : '○'}
              </div>
              <div className="text-sm text-muted-foreground">High Risk</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};