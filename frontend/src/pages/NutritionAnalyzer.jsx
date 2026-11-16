import React, { useState, useEffect } from 'react';
import {
  Activity,
  Upload,
  Camera,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Scale,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  UtensilsCrossed,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './NutritionAnalyzer.css';

export const NutritionAnalyzer = () => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'comparison' | 'tracker'

  // Tab 1: Analyzer Form States
  const [dishName, setDishName] = useState('Mediterranean Quinoa Salad');
  const [ingredientsText, setIngredientsText] = useState('quinoa, cucumber, cherry tomatoes, kalamata olives, feta cheese, olive oil, lemon juice');
  const [servingSize, setServingSize] = useState('1 bowl (250g)');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Tab 2: Comparison States
  const [food1Name, setFood1Name] = useState('Grilled Salmon with Asparagus');
  const [food1Ing, setFood1Ing] = useState('salmon, asparagus, olive oil, lemon');
  const [food2Name, setFood2Name] = useState('Fried Chicken with French Fries');
  const [food2Ing, setFood2Ing] = useState('chicken breast, flour, vegetable oil, potatoes, salt');
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  // Tab 3: Food Diary / Tracker States
  const [dailySummary, setDailySummary] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Log Form State
  const [logFoodName, setLogFoodName] = useState('');
  const [logMealType, setLogMealType] = useState('Lunch');
  const [logCalories, setLogCalories] = useState('');
  const [logProtein, setLogProtein] = useState('');
  const [logCarbs, setLogCarbs] = useState('');
  const [logFat, setLogFat] = useState('');
  const [addingLog, setAddingLog] = useState(false);

  // Load Diary Data on mount if authenticated
  const fetchDiaryData = async () => {
    if (!isAuthenticated) return;
    setLoadingLogs(true);
    try {
      const [logsRes, summaryRes] = await Promise.all([
        api.get('/nutrition/logs'),
        api.get('/nutrition/summary'),
      ]);

      if (logsRes.data.success) {
        setFoodLogs(logsRes.data.logs || []);
      }
      if (summaryRes.data.success) {
        setDailySummary(summaryRes.data);
      }
    } catch (err) {
      console.error('Error fetching nutrition logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tracker') {
      fetchDiaryData();
    }
  }, [activeTab, isAuthenticated]);

  // Handle Photo Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('Please select an image smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
  };

  // Run Nutrition Analysis
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!dishName.trim() && !imageBase64) {
      toast.warning('Please provide a dish name or upload a food photo!');
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await api.post('/nutrition/analyze', {
        foodName: dishName.trim(),
        ingredients: ingredientsText.trim(),
        servingSize: servingSize.trim(),
        imageBase64: imageBase64 || null,
        mimeType: 'image/jpeg',
      });

      if (res.data.success) {
        setAnalysisResult(res.data.analysis);
        toast.success('Food nutrition and health score analyzed! 📊');
      }
    } catch (err) {
      toast.error(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Run Comparison
  const handleCompare = async (e) => {
    e.preventDefault();
    if (!food1Name.trim() || !food2Name.trim()) {
      toast.warning('Please enter dish names for both items to compare.');
      return;
    }

    setComparing(true);
    setComparisonResult(null);

    try {
      const res = await api.post('/nutrition/compare', {
        food1: { name: food1Name.trim(), ingredients: food1Ing.trim() },
        food2: { name: food2Name.trim(), ingredients: food2Ing.trim() },
      });

      if (res.data.success) {
        setComparisonResult(res.data.comparison);
        toast.success('Dishes compared successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to compare foods.');
    } finally {
      setComparing(false);
    }
  };

  // Add Meal Entry to Diary
  const handleAddDiaryEntry = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to save meals to your food diary.');
      return;
    }
    if (!logFoodName.trim()) {
      toast.warning('Please enter the food name.');
      return;
    }

    setAddingLog(true);
    try {
      const res = await api.post('/nutrition/logs', {
        foodName: logFoodName.trim(),
        mealType: logMealType,
        calories: Number(logCalories) || 0,
        protein: Number(logProtein) || 0,
        carbohydrates: Number(logCarbs) || 0,
        fat: Number(logFat) || 0,
      });

      if (res.data.success) {
        toast.success(`"${logFoodName}" logged to today's diary!`);
        setLogFoodName('');
        setLogCalories('');
        setLogProtein('');
        setLogCarbs('');
        setLogFat('');
        fetchDiaryData();
      }
    } catch (err) {
      toast.error(err.message || 'Could not save diary entry.');
    } finally {
      setAddingLog(false);
    }
  };

  // Log from active analysis directly to diary
  const handleLogCurrentAnalysis = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save to your daily diary.');
      return;
    }
    if (!analysisResult) return;

    try {
      const res = await api.post('/nutrition/logs', {
        foodName: analysisResult.foodName,
        mealType: 'Lunch',
        servingSize: analysisResult.servingSize,
        ...analysisResult.nutrition,
      });

      if (res.data.success) {
        toast.success(`"${analysisResult.foodName}" added to today's Food Diary! 🥗`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to log food.');
    }
  };

  // Delete Diary Entry
  const handleDeleteDiaryEntry = async (logId) => {
    try {
      const res = await api.delete(`/nutrition/logs/${logId}`);
      if (res.data.success) {
        setFoodLogs((prev) => prev.filter((l) => l._id !== logId));
        fetchDiaryData();
        toast.info('Entry removed from diary.');
      }
    } catch (err) {
      toast.error(err.message || 'Could not delete entry.');
    }
  };

  // Helper for Health Score color
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'score-green';
    if (score >= 60) return 'score-yellow';
    return 'score-orange';
  };

  return (
    <div className="nutrition-page">
      <div className="container">
        {/* Header */}
        <div className="nutrition-header">
          <div className="nutrition-tag-badge">
            <Activity size={16} />
            <span>Nutritional Intelligence & Health</span>
          </div>
          <h1>AI Nutrition & Food Health Analyzer</h1>
          <p>
            Estimate calories, macronutrients, and receive an objective Health Score (0-100) with
            actionable healthier substitutions and daily diary tracking.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="nutrition-tabs-bar">
          <button
            className={`nutri-tab ${activeTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            <Activity size={18} />
            Food Nutrition & Health Score
          </button>
          <button
            className={`nutri-tab ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            <Scale size={18} />
            Food Comparison
          </button>
          <button
            className={`nutri-tab ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            <Calendar size={18} />
            Daily Nutrition Diary
          </button>
        </div>

        {/* ================= TAB 1: ANALYZER ================= */}
        {activeTab === 'analyzer' && (
          <div className="analyzer-tab-content">
            <div className="analyzer-grid">
              {/* Left Column: Input Form */}
              <div className="analyzer-form-card">
                <h3>Analyze Food or Recipe</h3>
                <p className="card-subtext">
                  Enter dish ingredients or upload a food photo for AI analysis.
                </p>

                <form onSubmit={handleAnalyze}>
                  <div className="form-group">
                    <label className="form-label">Dish or Food Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Avocado Toast with Poached Egg"
                      value={dishName}
                      onChange={(e) => setDishName(e.target.value)}
                      className="gen-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ingredients & Estimated Quantities</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. 2 slices sourdough, 1 avocado, 2 eggs, 1 tbsp olive oil, pinch chili flakes"
                      value={ingredientsText}
                      onChange={(e) => setIngredientsText(e.target.value)}
                      className="gen-textarea"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Serving Size / Portion</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 bowl, 250g, 1 plate"
                      value={servingSize}
                      onChange={(e) => setServingSize(e.target.value)}
                      className="gen-input"
                    />
                  </div>

                  {/* Food Image Upload */}
                  <div className="form-group">
                    <label className="form-label">
                      <Camera size={16} /> Optional: Upload Food Photo
                    </label>

                    {imagePreview ? (
                      <div className="image-preview-box">
                        <img src={imagePreview} alt="Uploaded food" className="uploaded-thumb" />
                        <button type="button" className="remove-img-btn" onClick={removeImage}>
                          ✕ Remove Photo
                        </button>
                      </div>
                    ) : (
                      <label className="upload-dropzone">
                        <Upload size={24} className="upload-icon" />
                        <span>Click to browse food image (JPG, PNG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-full"
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <>
                        <span className="spinner" /> Analyzing Nutrients...
                      </>
                    ) : (
                      <>
                        <Activity size={18} /> Analyze Food Nutrition
                      </>
                    )}
                  </button>
                </form>

                {/* Honest Safety Disclaimer */}
                <div className="honest-disclaimer-box">
                  <ShieldCheck size={18} className="shield-icon" />
                  <p>
                    <strong>Responsible Nutrition Note:</strong> Values are computed estimates.
                    Nutrient density varies by cooking oils and sodium. Not intended as clinical dietary advice.
                  </p>
                </div>
              </div>

              {/* Right Column: Analysis Results Display */}
              <div className="analyzer-results-pane">
                {analyzing ? (
                  <div className="analyzing-loader-card">
                    <div className="pulse-heart-icon">🥗</div>
                    <h3>Calculating Nutritional Breakdown...</h3>
                    <p>
                      Scanning ingredient density, assessing macronutrient ratios, and formulating personalized health recommendations.
                    </p>
                  </div>
                ) : analysisResult ? (
                  <div className="analysis-card">
                    {/* Header Row */}
                    <div className="analysis-card-top">
                      <div>
                        <span className="analysis-badge">AI Nutrition Profile</span>
                        <h2>{analysisResult.foodName}</h2>
                        <span className="analysis-portion">Serving: {analysisResult.servingSize}</span>
                      </div>
                      {isAuthenticated && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={handleLogCurrentAnalysis}
                        >
                          <Plus size={15} /> Add to Today's Diary
                        </button>
                      )}
                    </div>

                    {/* Health Score Gauge */}
                    <div className="health-score-container">
                      <div className={`score-dial ${getScoreColorClass(analysisResult.healthScore)}`}>
                        <span className="dial-num">{analysisResult.healthScore}</span>
                        <span className="dial-max">/ 100</span>
                      </div>
                      <div className="score-details">
                        <h4>Nutritional Quality Score</h4>
                        <p>{analysisResult.scoreExplanation}</p>
                        <div className="score-aspects-grid">
                          <div className="aspect-col aspect-pos">
                            <strong>
                              <CheckCircle2 size={14} /> Positive Aspects:
                            </strong>
                            <ul>
                              {analysisResult.positiveAspects?.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="aspect-col aspect-imp">
                            <strong>
                              <AlertCircle size={14} /> Areas to Improve:
                            </strong>
                            <ul>
                              {analysisResult.areasToImprove?.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comprehensive Nutritional Breakdown */}
                    <div className="nutrients-breakdown-section">
                      <h3>Macronutrient & Calorie Breakdown</h3>
                      <div className="nutrients-stat-grid">
                        <div className="nutrient-tile tile-primary">
                          <span className="tile-title">Calories</span>
                          <span className="tile-value">{analysisResult.nutrition.calories}</span>
                          <span className="tile-unit">kcal</span>
                        </div>
                        <div className="nutrient-tile">
                          <span className="tile-title">Protein</span>
                          <span className="tile-value">{analysisResult.nutrition.protein}</span>
                          <span className="tile-unit">grams</span>
                        </div>
                        <div className="nutrient-tile">
                          <span className="tile-title">Carbohydrates</span>
                          <span className="tile-value">{analysisResult.nutrition.carbohydrates}</span>
                          <span className="tile-unit">grams</span>
                        </div>
                        <div className="nutrient-tile">
                          <span className="tile-title">Total Fat</span>
                          <span className="tile-value">{analysisResult.nutrition.fat}</span>
                          <span className="tile-unit">grams</span>
                        </div>
                        <div className="nutrient-tile">
                          <span className="tile-title">Saturated Fat</span>
                          <span className="tile-value">{analysisResult.nutrition.saturatedFat}</span>
                          <span className="tile-unit">grams</span>
                        </div>
                        <div className="nutrient-tile">
                          <span className="tile-title">Sugar</span>
                          <span className="tile-value">{analysisResult.nutrition.sugar}</span>
                          <span className="tile-unit">grams</span>
                        </div>
                        <div className="nutrient-tile">
                          <span className="tile-title">Dietary Fiber</span>
                          <span className="tile-value">{analysisResult.nutrition.fiber}</span>
                          <span className="tile-unit">grams</span>
                        </div>
                        <div className="nutrient-tile">
                          <span className="tile-title">Sodium</span>
                          <span className="tile-value">{analysisResult.nutrition.sodium}</span>
                          <span className="tile-unit">mg</span>
                        </div>
                      </div>
                    </div>

                    {/* Healthier Food Suggestions */}
                    {analysisResult.healthierSuggestions?.length > 0 && (
                      <div className="healthier-suggestions-section">
                        <h3>Actionable Healthier Adjustments</h3>
                        <div className="suggestions-cards-list">
                          {analysisResult.healthierSuggestions.map((sug, idx) => (
                            <div key={idx} className="suggestion-item-card">
                              <span className="sug-tag">{sug.category}</span>
                              <p className="sug-tip">{sug.tip}</p>
                              <span className="sug-impact">✨ Impact: {sug.impact}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Original vs Healthier Version Comparison */}
                    {analysisResult.comparison && (
                      <div className="side-by-side-comparison">
                        <h3>Original Food vs Healthier Version</h3>
                        <div className="comparison-table-wrap">
                          <table className="comparison-table">
                            <thead>
                              <tr>
                                <th>Nutrient</th>
                                <th>{analysisResult.comparison.original.name}</th>
                                <th className="th-healthier">
                                  {analysisResult.comparison.healthier.name}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Calories</td>
                                <td>{analysisResult.comparison.original.nutrition.calories} kcal</td>
                                <td className="td-healthier">
                                  {analysisResult.comparison.healthier.nutrition.calories} kcal
                                </td>
                              </tr>
                              <tr>
                                <td>Protein</td>
                                <td>{analysisResult.comparison.original.nutrition.protein}g</td>
                                <td className="td-healthier">
                                  {analysisResult.comparison.healthier.nutrition.protein}g
                                </td>
                              </tr>
                              <tr>
                                <td>Fat</td>
                                <td>{analysisResult.comparison.original.nutrition.fat}g</td>
                                <td className="td-healthier">
                                  {analysisResult.comparison.healthier.nutrition.fat}g
                                </td>
                              </tr>
                              <tr>
                                <td>Sugar</td>
                                <td>{analysisResult.comparison.original.nutrition.sugar}g</td>
                                <td className="td-healthier">
                                  {analysisResult.comparison.healthier.nutrition.sugar}g
                                </td>
                              </tr>
                              <tr>
                                <td>Dietary Fiber</td>
                                <td>{analysisResult.comparison.original.nutrition.fiber}g</td>
                                <td className="td-healthier">
                                  {analysisResult.comparison.healthier.nutrition.fiber}g
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-analysis-prompt">
                    <div className="empty-icon-round">
                      <Activity size={36} />
                    </div>
                    <h3>Ready for Nutrition Insights</h3>
                    <p>
                      Enter your meal details on the left and click "Analyze Food Nutrition" to view
                      the Health Score, calorie breakdown, and healthier alternatives.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: FOOD COMPARISON ================= */}
        {activeTab === 'comparison' && (
          <div className="comparison-tab-content">
            <div className="comparison-form-card">
              <h3>Compare Two Foods Side-by-Side</h3>
              <p className="card-subtext">
                See direct macronutrient differences to make informed culinary choices.
              </p>

              <form onSubmit={handleCompare}>
                <div className="compare-inputs-grid">
                  <div className="compare-input-box">
                    <span className="badge badge-primary">Option 1</span>
                    <div className="form-group">
                      <label className="form-label">Dish / Food 1 *</label>
                      <input
                        type="text"
                        value={food1Name}
                        onChange={(e) => setFood1Name(e.target.value)}
                        className="gen-input"
                        placeholder="e.g. Grilled Salmon"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ingredients (Optional)</label>
                      <input
                        type="text"
                        value={food1Ing}
                        onChange={(e) => setFood1Ing(e.target.value)}
                        className="gen-input"
                        placeholder="e.g. salmon, lemon, olive oil"
                      />
                    </div>
                  </div>

                  <div className="compare-divider">VS</div>

                  <div className="compare-input-box">
                    <span className="badge badge-accent">Option 2</span>
                    <div className="form-group">
                      <label className="form-label">Dish / Food 2 *</label>
                      <input
                        type="text"
                        value={food2Name}
                        onChange={(e) => setFood2Name(e.target.value)}
                        className="gen-input"
                        placeholder="e.g. Fried Chicken with Fries"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ingredients (Optional)</label>
                      <input
                        type="text"
                        value={food2Ing}
                        onChange={(e) => setFood2Ing(e.target.value)}
                        className="gen-input"
                        placeholder="e.g. chicken, batter, deep fry oil"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-accent btn-lg" disabled={comparing}>
                    {comparing ? 'Comparing Dishes...' : 'Run Nutritional Comparison'}
                  </button>
                </div>
              </form>
            </div>

            {/* Comparison Results */}
            {comparisonResult && (
              <div className="comparison-results-card">
                <h2>Comparison Results</h2>

                <div className="comparison-cards-row">
                  <div className="comp-item-card">
                    <h3>{comparisonResult.item1.foodName}</h3>
                    <div className={`comp-score-badge ${getScoreColorClass(comparisonResult.item1.healthScore)}`}>
                      Score: {comparisonResult.item1.healthScore}/100
                    </div>
                    <div className="comp-stats-list">
                      <div><span>Calories:</span> <strong>{comparisonResult.item1.nutrition.calories} kcal</strong></div>
                      <div><span>Protein:</span> <strong>{comparisonResult.item1.nutrition.protein}g</strong></div>
                      <div><span>Carbs:</span> <strong>{comparisonResult.item1.nutrition.carbohydrates}g</strong></div>
                      <div><span>Fat:</span> <strong>{comparisonResult.item1.nutrition.fat}g</strong></div>
                      <div><span>Sugar:</span> <strong>{comparisonResult.item1.nutrition.sugar}g</strong></div>
                      <div><span>Fiber:</span> <strong>{comparisonResult.item1.nutrition.fiber}g</strong></div>
                      <div><span>Sodium:</span> <strong>{comparisonResult.item1.nutrition.sodium}mg</strong></div>
                    </div>
                  </div>

                  <div className="comp-delta-card">
                    <h4>Key Differences</h4>
                    <p className="delta-sub">(Option 1 vs Option 2)</p>
                    <div className="deltas-list">
                      <div className="delta-row">
                        <span>Calories Diff:</span>
                        <strong className={comparisonResult.differences.caloriesDiff < 0 ? 'text-green' : 'text-orange'}>
                          {comparisonResult.differences.caloriesDiff > 0 ? '+' : ''}
                          {comparisonResult.differences.caloriesDiff} kcal
                        </strong>
                      </div>
                      <div className="delta-row">
                        <span>Protein Diff:</span>
                        <strong className={comparisonResult.differences.proteinDiff > 0 ? 'text-green' : ''}>
                          {comparisonResult.differences.proteinDiff > 0 ? '+' : ''}
                          {comparisonResult.differences.proteinDiff}g
                        </strong>
                      </div>
                      <div className="delta-row">
                        <span>Sugar Diff:</span>
                        <strong className={comparisonResult.differences.sugarDiff < 0 ? 'text-green' : 'text-orange'}>
                          {comparisonResult.differences.sugarDiff > 0 ? '+' : ''}
                          {comparisonResult.differences.sugarDiff}g
                        </strong>
                      </div>
                      <div className="delta-row">
                        <span>Health Score Diff:</span>
                        <strong className={comparisonResult.differences.healthScoreDiff > 0 ? 'text-green' : 'text-orange'}>
                          {comparisonResult.differences.healthScoreDiff > 0 ? '+' : ''}
                          {comparisonResult.differences.healthScoreDiff} pts
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="comp-item-card">
                    <h3>{comparisonResult.item2.foodName}</h3>
                    <div className={`comp-score-badge ${getScoreColorClass(comparisonResult.item2.healthScore)}`}>
                      Score: {comparisonResult.item2.healthScore}/100
                    </div>
                    <div className="comp-stats-list">
                      <div><span>Calories:</span> <strong>{comparisonResult.item2.nutrition.calories} kcal</strong></div>
                      <div><span>Protein:</span> <strong>{comparisonResult.item2.nutrition.protein}g</strong></div>
                      <div><span>Carbs:</span> <strong>{comparisonResult.item2.nutrition.carbohydrates}g</strong></div>
                      <div><span>Fat:</span> <strong>{comparisonResult.item2.nutrition.fat}g</strong></div>
                      <div><span>Sugar:</span> <strong>{comparisonResult.item2.nutrition.sugar}g</strong></div>
                      <div><span>Fiber:</span> <strong>{comparisonResult.item2.nutrition.fiber}g</strong></div>
                      <div><span>Sodium:</span> <strong>{comparisonResult.item2.nutrition.sodium}mg</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: DAILY FOOD DIARY ================= */}
        {activeTab === 'tracker' && (
          <div className="tracker-tab-content">
            {!isAuthenticated ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Calendar size={32} />
                </div>
                <h2>Daily Nutrition Diary</h2>
                <p>Log your breakfast, lunch, dinner, and snacks to monitor your daily intake against standard RDA goals.</p>
                <div className="empty-state-actions">
                  <a href="/login" className="btn btn-primary">Log In</a>
                  <a href="/register" className="btn btn-outline">Create Account</a>
                </div>
              </div>
            ) : (
              <div className="diary-layout">
                {/* Daily Progress Bars Card */}
                {dailySummary && (
                  <div className="daily-summary-card">
                    <h3>Today's Nutrition Summary & RDA Progress</h3>
                    <div className="progress-bars-grid">
                      {/* Calories */}
                      <div className="progress-metric-item">
                        <div className="metric-header">
                          <span>Calories</span>
                          <strong>
                            {dailySummary.totals.calories} / {dailySummary.targets.calories} kcal
                          </strong>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill fill-cal"
                            style={{ width: `${dailySummary.percentages.calories}%` }}
                          />
                        </div>
                        <span className="prog-percent">{dailySummary.percentages.calories}% of RDA</span>
                      </div>

                      {/* Protein */}
                      <div className="progress-metric-item">
                        <div className="metric-header">
                          <span>Protein</span>
                          <strong>
                            {dailySummary.totals.protein} / {dailySummary.targets.protein}g
                          </strong>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill fill-pro"
                            style={{ width: `${dailySummary.percentages.protein}%` }}
                          />
                        </div>
                        <span className="prog-percent">{dailySummary.percentages.protein}% of RDA</span>
                      </div>

                      {/* Carbs */}
                      <div className="progress-metric-item">
                        <div className="metric-header">
                          <span>Carbohydrates</span>
                          <strong>
                            {dailySummary.totals.carbohydrates} / {dailySummary.targets.carbohydrates}g
                          </strong>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill fill-carb"
                            style={{ width: `${dailySummary.percentages.carbohydrates}%` }}
                          />
                        </div>
                        <span className="prog-percent">{dailySummary.percentages.carbohydrates}% of RDA</span>
                      </div>

                      {/* Fats */}
                      <div className="progress-metric-item">
                        <div className="metric-header">
                          <span>Fats</span>
                          <strong>
                            {dailySummary.totals.fat} / {dailySummary.targets.fat}g
                          </strong>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill fill-fat"
                            style={{ width: `${dailySummary.percentages.fat}%` }}
                          />
                        </div>
                        <span className="prog-percent">{dailySummary.percentages.fat}% of RDA</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="diary-grid-2">
                  {/* Log Meal Form */}
                  <div className="diary-form-card">
                    <h3>Log a Meal</h3>
                    <form onSubmit={handleAddDiaryEntry}>
                      <div className="form-group">
                        <label className="form-label">Food / Meal Name *</label>
                        <input
                          type="text"
                          value={logFoodName}
                          onChange={(e) => setLogFoodName(e.target.value)}
                          placeholder="e.g. Oatmeal with Berries"
                          className="gen-input"
                          required
                        />
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Meal Slot</label>
                          <select
                            value={logMealType}
                            onChange={(e) => setLogMealType(e.target.value)}
                            className="gen-select"
                          >
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Snacks">Snacks</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Calories (kcal)</label>
                          <input
                            type="number"
                            value={logCalories}
                            onChange={(e) => setLogCalories(e.target.value)}
                            placeholder="e.g. 350"
                            className="gen-input"
                          />
                        </div>
                      </div>

                      <div className="form-grid-3">
                        <div className="form-group">
                          <label className="form-label">Protein (g)</label>
                          <input
                            type="number"
                            value={logProtein}
                            onChange={(e) => setLogProtein(e.target.value)}
                            placeholder="e.g. 15"
                            className="gen-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Carbs (g)</label>
                          <input
                            type="number"
                            value={logCarbs}
                            onChange={(e) => setLogCarbs(e.target.value)}
                            placeholder="e.g. 45"
                            className="gen-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Fat (g)</label>
                          <input
                            type="number"
                            value={logFat}
                            onChange={(e) => setLogFat(e.target.value)}
                            placeholder="e.g. 10"
                            className="gen-input"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={addingLog || !logFoodName.trim()}
                      >
                        <Plus size={16} />
                        {addingLog ? 'Adding...' : 'Add to Food Diary'}
                      </button>
                    </form>
                  </div>

                  {/* Logged Meals List */}
                  <div className="diary-list-card">
                    <h3>Today's Logged Meals ({foodLogs.length})</h3>
                    {foodLogs.length > 0 ? (
                      <div className="diary-items-stack">
                        {foodLogs.map((log) => (
                          <div key={log._id} className="diary-entry-item">
                            <div className="diary-entry-info">
                              <span className="diary-meal-badge">{log.mealType}</span>
                              <h4 className="diary-food-name">{log.foodName}</h4>
                              <div className="diary-macros-row">
                                <span>{log.calories} kcal</span>
                                <span>• {log.protein}g P</span>
                                <span>• {log.carbohydrates}g C</span>
                                <span>• {log.fat}g F</span>
                              </div>
                            </div>
                            <button
                              className="diary-delete-btn"
                              onClick={() => handleDeleteDiaryEntry(log._id)}
                              title="Delete entry"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state" style={{ padding: '30px 10px' }}>
                        <p>No meals logged today yet. Add your first meal using the form!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionAnalyzer;

